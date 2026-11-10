import { execFileSync } from 'node:child_process';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  fixture,
  baseURL,
  secret,
  password,
  origin,
  username,
  testDatabaseUrl,
} from './auth-fixture.js';
import { createAuthService } from '../src/modules/platform/auth/service.js';

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
const setup = (code: string) =>
  f.app.inject({
    method: 'POST',
    url: '/api/auth/setup',
    headers: origin,
    payload: { code, username: username(), password },
  });
describe('configuração inicial única', () => {
  it('emite pelo comando local, configura sem sessão e fecha cadastro', async () => {
    const code = execFileSync(
      process.execPath,
      ['--import', 'tsx', 'src/modules/platform/auth/operator.ts'],
      {
        env: {
          ...process.env,
          DATABASE_URL: testDatabaseUrl(),
          AUTH_SECRET: secret,
          AUTH_BASE_URL: baseURL,
        },
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    ).trim();
    expect(code).toMatch(/^[a-f0-9]{64}$/);
    const before = await f.app.inject('/api/auth/setup');
    expect(before.json()).toEqual({ configured: false });
    const response = await setup(code);
    expect(response.statusCode).toBe(201);
    expect(response.headers['set-cookie']).toBeUndefined();
    expect((await f.app.inject('/api/auth/setup')).json()).toEqual({ configured: true });
    expect((await setup(code)).statusCode).toBe(409);
    await expect(f.auth.issueBootstrap()).rejects.toMatchObject({ status: 409 });
    expect((await f.database.pool.query('select "globalAdmin" from platform."user"')).rows).toEqual(
      [{ globalAdmin: true }],
    );
    expect((await f.database.pool.query('select * from platform.session')).rows).toHaveLength(0);
  });
  it('recusa inválido, reemitido, expirado e permite somente um consumo entre instâncias', async () => {
    const first = await f.auth.issueBootstrap();
    const second = await f.auth.issueBootstrap();
    expect((await setup(first)).statusCode).toBe(400);
    f.advance(30 * 60000);
    expect((await setup(second)).statusCode).toBe(400);
    const third = await f.auth.issueBootstrap();
    const other = createAuthService(f.options);
    const results = await Promise.allSettled([
      f.auth.bootstrap(third, { username: username(), password }),
      other.bootstrap(third, { username: username(), password }),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect((await f.database.pool.query('select id from platform."user"')).rows).toHaveLength(1);
  });
  it('falha de persistência reverte consumo e conta', async () => {
    const code = await f.auth.issueBootstrap();
    await f.database.pool.query(
      "create or replace function platform.test_refuse_setup() returns trigger language plpgsql as $$ begin raise exception 'injected'; end $$",
    );
    await f.database.pool.query(
      'create trigger test_refuse_setup before update on platform.auth_setup for each row execute function platform.test_refuse_setup()',
    );
    try {
      expect((await setup(code)).statusCode).toBe(503);
    } finally {
      await f.database.pool.query('drop trigger test_refuse_setup on platform.auth_setup');
    }
    expect((await f.database.pool.query('select id from platform."user"')).rows).toHaveLength(0);
    expect((await setup(code)).statusCode).toBe(201);
  });
  it('limita bootstrap inválido por origem sem bloquear instalação', async () => {
    for (let i = 0; i < 10; i++) expect((await setup('invalid')).statusCode).toBe(400);
    expect((await setup('invalid')).statusCode).toBe(429);
    const code = await f.auth.issueBootstrap();
    f.advance(60000);
    expect((await setup(code)).statusCode).toBe(201);
  });
});
