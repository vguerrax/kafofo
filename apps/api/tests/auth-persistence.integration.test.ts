import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { fileURLToPath } from 'node:url';
import { databaseFixture as fixture, username } from './auth-database-fixture.js';
import { createTransactions } from '../src/modules/platform/auth/transaction.js';
import { createIdentity } from '../src/modules/platform/auth/adapter.js';

let f: Awaited<ReturnType<typeof fixture>>;
beforeAll(async () => {
  f = await fixture();
});
beforeEach(async () => {
  await f.reset();
});
afterAll(async () => {
  await f?.close();
});
describe('persistência e contenção', () => {
  it('usa PostgreSQL 17 e reaplica migrações sem duplicar', async () => {
    const version = Number(
      (await f.database.pool.query('show server_version_num')).rows[0].server_version_num,
    );
    expect(version).toBeGreaterThanOrEqual(170000);
    expect(version).toBeLessThan(180000);
    const before = await f.database.pool.query('select count(*) from drizzle.__drizzle_migrations');
    await migrate(f.database.db, {
      migrationsFolder: fileURLToPath(new URL('../drizzle', import.meta.url)),
    });
    expect(
      (await f.database.pool.query('select count(*) from drizzle.__drizzle_migrations')).rows,
    ).toEqual(before.rows);
  });
  it('unicidade canônica é garantida entre transações concorrentes', async () => {
    const name = username();
    const results = await Promise.allSettled([f.identity(name), f.identity(name.toUpperCase())]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(
      (await f.database.pool.query('select username,email from platform."user"')).rows,
    ).toEqual([{ username: name, email: expect.stringMatching(/@identity\.invalid$/) }]);
    await expect(
      f.database.pool.query('update platform."user" set username=upper(username)'),
    ).rejects.toThrow();
  });
  it('rollback não deixa conta/credencial parcial', async () => {
    await expect(
      createTransactions(f.database.pool).run('rollback', async (client) => {
        await createIdentity(client, f.options, {
          username: username(),
          password: 'test-password',
        });
        throw new Error('injected');
      }),
    ).rejects.toMatchObject({ status: 503 });
    expect((await f.database.pool.query('select id from platform."user"')).rows).toHaveLength(0);
    expect((await f.database.pool.query('select id from platform.account')).rows).toHaveLength(0);
  });
  it('lock expira sem prender conexões e recusa excesso sem fila', async () => {
    const client = await f.database.pool.connect();
    await client.query('begin');
    await client.query("select pg_advisory_xact_lock(hashtext('contention'))");
    try {
      const start = Date.now();
      await expect(
        createTransactions(f.database.pool).run('contention', async () => true),
      ).rejects.toMatchObject({ status: 503 });
      expect(Date.now() - start).toBeLessThan(3000);
    } finally {
      await client.query('rollback');
      client.release();
    }
    const transactions = createTransactions(f.database.pool, 1);
    let release!: () => void;
    let entered!: () => void;
    const ready = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const first = transactions.run('one', async () => {
      entered();
      await gate;
    });
    await ready;
    await expect(transactions.run('two', async () => true)).rejects.toMatchObject({ status: 503 });
    release();
    await first;
    expect(await transactions.run('three', async () => true)).toBe(true);
  });
});
