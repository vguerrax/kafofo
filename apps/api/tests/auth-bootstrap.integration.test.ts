import { afterAll, beforeAll, expect, it } from 'vitest';
import { databaseFixture, username, password } from './auth-database-fixture.js';
import { createBootstrap } from '../src/modules/platform/auth/bootstrap.js';
import { createTransactions } from '../src/modules/platform/auth/transaction.js';
let f: Awaited<ReturnType<typeof databaseFixture>>;
beforeAll(async () => {
  f = await databaseFixture();
  await f.reset();
});
afterAll(async () => {
  await f?.close();
});
it('serviço local consome uma vez entre instâncias sem criar sessão', async () => {
  const first = createBootstrap(f.options, createTransactions(f.database.pool));
  const second = createBootstrap(f.options, createTransactions(f.database.pool));
  const code = await first.issueBootstrap();
  const attempts = await Promise.allSettled([
    first.bootstrap(code, { username: username(), password }),
    second.bootstrap(code, { username: username(), password }),
  ]);
  expect(attempts.filter((value) => value.status === 'fulfilled')).toHaveLength(1);
  expect(await first.configured()).toBe(true);
  expect((await f.database.pool.query('select * from platform.session')).rows).toHaveLength(0);
  await expect(second.issueBootstrap()).rejects.toMatchObject({ status: 409 });
});
