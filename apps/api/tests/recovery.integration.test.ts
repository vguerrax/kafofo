import { createLogger } from '../src/logger.js';
import { createRecoveryService } from '../src/modules/platform/recovery/service.js';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, expect, it } from 'vitest';
import { recoveryDatabase } from './recovery-database.js';
import { createIdentity } from '../src/modules/platform/auth/adapter.js';
import { createTransactions } from '../src/modules/platform/auth/transaction.js';
import { createAuthService } from '../src/modules/platform/auth/service.js';
import { createContextService } from '../src/modules/platform/contexts/service.js';
import { buildApp } from '../src/app.js';
import { cookie } from './auth-fixture.js';
const baseURL = 'http://127.0.0.1:5304',
  secret = randomUUID() + randomUUID(),
  password = 'test-password';
let db: Awaited<ReturnType<typeof recoveryDatabase>>;
let recovery: ReturnType<typeof createRecoveryService>;
let clock = Date.now();
let logs = '';
let service: ReturnType<typeof createContextService>;
let auth: ReturnType<typeof createAuthService>;
let app: Awaited<ReturnType<typeof buildApp>>;
let options: { pool: typeof db.pool; secret: string; baseURL: string };
async function person() {
  const username = 'u' + randomUUID().replaceAll('-', '').slice(0, 20);
  const user = await createTransactions(db.pool).run(null, (c) =>
    createIdentity(c, options, { username, password }),
  );
  const response = await auth.login({ username, password }, new Headers(), 'source' + username);
  return {
    ...user,
    headers: new Headers({
      cookie: cookie({ headers: { 'set-cookie': response.headers.getSetCookie() } }),
    }),
  };
}
beforeAll(async () => {
  db = await recoveryDatabase();
  options = { pool: db.pool, secret, baseURL };
  auth = createAuthService(options);
  service = createContextService(options);
  recovery = createRecoveryService({ ...options, now: () => clock });
  app = await buildApp({
    logger: createLogger('info', {
      write: (line: string) => {
        logs += line;
      },
    }),
    auth,
    authOrigin: baseURL,
    contexts: service,
    recovery,
  });
});
beforeEach(async () => {
  clock = Date.now();
  await db.pool.query('truncate platform.cores,platform."user",platform.auth_limits cascade');
});
afterAll(async () => {
  await app?.close();
  await db?.close();
});

async function fixture() {
  const admin = await person(),
    target = await person();
  await db.pool.query('update platform."user" set "globalAdmin"=true where id=$1', [admin.id]);
  const issued = await recovery.issue({ kind: 'admin', headers: admin.headers }, target.username);
  return { admin, target, issued, token: new URL(issued.link).hash.slice(9) };
}
it('somente global emite para outra conta; operador só recupera global', async () => {
  const { admin, target } = await fixture();
  await service.createCore(target.headers, 'Núcleo administrado');
  await expect(
    recovery.issue({ kind: 'admin', headers: target.headers }, admin.username),
  ).rejects.toMatchObject({ status: 403 });
  await expect(
    recovery.issue({ kind: 'admin', headers: admin.headers }, admin.username),
  ).rejects.toMatchObject({ status: 403 });
  await expect(
    recovery.issue({ kind: 'operator', identity: 'operator-test' }, target.username),
  ).rejects.toMatchObject({ status: 403 });
  await expect(
    recovery.issue({ kind: 'operator', identity: 'operator-test' }, admin.username),
  ).resolves.toHaveProperty('link');
});
it('prévia não consome nem estende validade; borda e reemissão invalidam', async () => {
  const { admin, target, token } = await fixture();
  expect(await recovery.preview(token)).toEqual({ valid: true });
  expect(await recovery.preview(token)).toEqual({ valid: true });
  const next = await recovery.issue({ kind: 'admin', headers: admin.headers }, target.username);
  await expect(recovery.preview(token)).rejects.toMatchObject({ code: 'RECOVERY_UNAVAILABLE' });
  clock += 1800000;
  await expect(recovery.preview(new URL(next.link).hash.slice(9))).rejects.toMatchObject({
    code: 'RECOVERY_UNAVAILABLE',
  });
});
it('limite de emissão é compartilhado entre operador e administrador', async () => {
  const { admin } = await fixture(),
    another = await person();
  await db.pool.query('update platform."user" set "globalAdmin"=true where id=$1', [another.id]);
  await recovery.issue({ kind: 'operator', identity: 'operator-test' }, admin.username);
  await recovery.issue({ kind: 'admin', headers: another.headers }, admin.username);
  await recovery.issue({ kind: 'operator', identity: 'operator-test' }, admin.username);
  await expect(
    recovery.issue({ kind: 'admin', headers: another.headers }, admin.username),
  ).rejects.toMatchObject({ status: 429 });
});
it('quinta senha inválida invalida o link; consultas não incrementam falhas', async () => {
  const { token } = await fixture();
  for (let i = 0; i < 5; i++) {
    await recovery.preview(token);
    await expect(recovery.complete(token, 'bad')).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_PASSWORD',
    });
  }
  await expect(recovery.preview(token)).rejects.toMatchObject({ code: 'RECOVERY_UNAVAILABLE' });
  await expect(recovery.complete(token, 'valid-password')).rejects.toMatchObject({
    code: 'RECOVERY_UNAVAILABLE',
  });
});
it('troca uma vez, revoga sessões e permite login novo sem privilégios adicionais', async () => {
  const { target, token } = await fixture();
  const otherSession = await auth.login(
    { username: target.username, password },
    new Headers(),
    'second-session',
  );
  const otherHeaders = new Headers({
    cookie: cookie({ headers: { 'set-cookie': otherSession.headers.getSetCookie() } }),
  });
  await recovery.complete(token, 'replacement-password');
  expect(await auth.getSession(target.headers)).toBeNull();
  expect(await auth.getSession(otherHeaders)).toBeNull();
  await expect(
    auth.login({ username: target.username, password }, new Headers(), 'old'),
  ).rejects.toMatchObject({ status: 401 });
  await expect(
    auth.login(
      { username: target.username, password: 'replacement-password' },
      new Headers(),
      'new',
    ),
  ).resolves.toHaveProperty('ok', true);
  await expect(recovery.preview(token)).rejects.toMatchObject({ code: 'RECOVERY_UNAVAILABLE' });
});
it('usos concorrentes consomem apenas uma vez; auditoria sem segredos', async () => {
  const { token, issued } = await fixture();
  const results = await Promise.allSettled([
    recovery.complete(token, 'next-password'),
    recovery.complete(token, 'other-password'),
  ]);
  expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
  const events = (
    await db.pool.query('select * from platform.recovery_events order by "createdAt"')
  ).rows;
  expect(events.map((e) => e.action)).toEqual(['issued', 'used']);
  for (const secret of [token, issued.link, 'next-password', 'other-password'])
    expect(JSON.stringify(events)).not.toContain(secret);
});
it('falha ao revogar sessões reverte senha, consumo e evento', async () => {
  const { target, token } = await fixture();
  await db.pool.query(
    "create or replace function platform.recovery_test_fail() returns trigger language plpgsql as $$ begin raise exception 'injected'; end $$",
  );
  await db.pool.query(
    'create trigger recovery_test_fail before delete on platform.session for each row execute function platform.recovery_test_fail()',
  );
  try {
    await expect(recovery.complete(token, 'new-password')).rejects.toMatchObject({ status: 503 });
  } finally {
    await db.pool.query('drop trigger recovery_test_fail on platform.session');
  }
  expect(await recovery.preview(token)).toEqual({ valid: true });
  expect(await auth.getSession(target.headers)).not.toBeNull();
  await expect(
    auth.login({ username: target.username, password }, new Headers(), 'rollback'),
  ).resolves.toHaveProperty('ok', true);
  expect(
    (await db.pool.query("select * from platform.recovery_events where action='used'")).rows,
  ).toHaveLength(0);
});
it('reemissão concorrente com uso mantém desfecho serializado', async () => {
  const { admin, target, token } = await fixture();
  const results = await Promise.allSettled([
    recovery.issue({ kind: 'admin', headers: admin.headers }, target.username),
    recovery.complete(token, 'new-password'),
  ]);
  expect(results[0].status).toBe('fulfilled');
  await expect(recovery.preview(token)).rejects.toMatchObject({ code: 'RECOVERY_UNAVAILABLE' });
});
it('origens têm contadores independentes e tentativas limitadas não contam no link', async () => {
  const { token } = await fixture();
  const headers = { origin: baseURL };
  for (let i = 0; i < 30; i++)
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/api/auth/recovery/preview',
          headers,
          payload: { token: 'invalid' },
        })
      ).statusCode,
    ).toBe(404);
  const blocked = await app.inject({
    method: 'POST',
    url: '/api/auth/recovery/preview',
    headers,
    payload: { token },
  });
  expect(blocked.statusCode).toBe(429);
  expect(Number(blocked.headers['retry-after'])).toBeGreaterThan(0);
  for (let i = 0; i < 30; i++)
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/api/auth/recovery/complete',
          headers,
          payload: { token: 'invalid', newPassword: 'valid-password' },
        })
      ).statusCode,
    ).toBe(404);
  expect(
    (
      await app.inject({
        method: 'POST',
        url: '/api/auth/recovery/complete',
        headers,
        payload: { token, newPassword: 'bad' },
      })
    ).statusCode,
  ).toBe(429);
  expect(
    (await db.pool.query('select failures from platform.password_recoveries')).rows[0].failures,
  ).toBe(0);
});
it('origem e schemas estritos; logs e erros não incluem segredos', async () => {
  const { token } = await fixture();
  logs = '';
  expect(
    (
      await app.inject({
        method: 'POST',
        url: '/api/auth/recovery/complete',
        payload: { token, newPassword: 'marker-password' },
      })
    ).statusCode,
  ).toBe(403);
  const response = await app.inject({
    method: 'POST',
    url: '/api/auth/recovery/complete',
    headers: { origin: baseURL },
    payload: { token, newPassword: 'marker-password', extra: true },
  });
  expect(response.statusCode).toBe(400);
  expect(logs + response.body).not.toContain(token);
  expect(logs + response.body).not.toContain('marker-password');
});
it('comando local emite somente para global e não aceita senha em argumentos', async () => {
  const { admin, target } = await fixture();
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const run = promisify(execFile);
  const env = {
    ...process.env,
    DATABASE_URL: process.env['RECOVERY_TEST_DATABASE_URL']!,
    AUTH_SECRET: secret,
    AUTH_BASE_URL: baseURL,
  };
  const args = ['--import', 'tsx', 'src/modules/platform/recovery/operator.ts'];
  const result = await run(process.execPath, [...args, admin.username], { env });
  const token = new URL(result.stdout.trim()).hash.slice(9);
  expect(result.stderr).toBe('');
  await expect(recovery.preview(token)).resolves.toEqual({ valid: true });
  for (const input of [[target.username], [admin.username, 'password-must-not-be-accepted']]) {
    try {
      await run(process.execPath, [...args, ...input], { env });
      throw new Error('accepted');
    } catch (e) {
      expect(e).toMatchObject({ code: 1, stdout: '' });
      expect((e as { stderr: string }).stderr).not.toContain('password-must-not-be-accepted');
    }
  }
  const row = (
    await db.pool.query("select * from platform.recovery_events where channel='operator'")
  ).rows[0];
  expect(row.actor).toMatch(/^local-uid:\d+$/);
  expect(JSON.stringify(row)).not.toContain(token);
});
it('emissão falha não revoga link anterior nem consome cota', async () => {
  const { admin, target, token } = await fixture();
  await db.pool.query(
    "create or replace function platform.recovery_event_fail() returns trigger language plpgsql as $$ begin raise exception 'injected'; end $$",
  );
  await db.pool.query(
    'create trigger recovery_event_fail before insert on platform.recovery_events for each row execute function platform.recovery_event_fail()',
  );
  try {
    await expect(
      recovery.issue({ kind: 'admin', headers: admin.headers }, target.username),
    ).rejects.toMatchObject({ status: 503 });
  } finally {
    await db.pool.query('drop trigger recovery_event_fail on platform.recovery_events');
  }
  await expect(recovery.preview(token)).resolves.toEqual({ valid: true });
  const state = (
    await db.pool.query('select events from platform.auth_limits where key=$1', [
      'recovery-issue:' + target.id,
    ])
  ).rows[0];
  expect(state.events).toHaveLength(1);
});
it('revalida sessão revogada durante espera por lock de emissão', async () => {
  const { admin, target } = await fixture(),
    locker = await db.pool.connect();
  await locker.query('begin');
  await locker.query('select pg_advisory_xact_lock(hashtext($1))', ['account:' + admin.username]);
  await locker.query('delete from platform.session where "userId"=$1', [admin.id]);
  const assertion = expect(
    recovery.issue({ kind: 'admin', headers: admin.headers }, target.username),
  ).rejects.toMatchObject({ status: 401 });
  try {
    let waiting = false;
    for (let i = 0; i < 40; i++) {
      if (
        (
          await db.pool.query(
            "select count(*)::int n from pg_locks where locktype='advisory' and not granted",
          )
        ).rows[0].n
      ) {
        waiting = true;
        break;
      }
      await new Promise((r) => setTimeout(r, 10));
    }
    expect(waiting).toBe(true);
  } finally {
    await locker.query('commit');
    locker.release();
  }
  await assertion;
});
