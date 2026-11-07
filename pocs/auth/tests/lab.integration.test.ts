import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { openDatabase, migrate } from '../src/database/client.js';
import { createLab } from '../src/lab.js';
import { buildServer } from '../src/http.js';

const secret = randomUUID() + randomUUID();
const baseURL = 'http://127.0.0.1:5505';
const password = 'poc-password';
const origin = { origin: baseURL };
const source = '2001:db8:' + randomUUID().slice(0, 4) + ':' + randomUUID().slice(0, 4) + '::1';
let time = Date.now();
const now = () => time;
const pool = openDatabase(process.env['POC_DATABASE_URL']);
const lab = createLab({ pool, secret, baseURL, now });
const server = buildServer(lab, baseURL);
const name = () => 'u' + randomUUID().replaceAll('-', '').slice(0, 20);
const identity = (role: 'member' | 'global-admin' | 'core-admin' = 'member') =>
  lab.createIdentity({ username: name(), password, role });
async function login(username: string, pass = password) {
  return server.inject({
    remoteAddress: source,
    method: 'POST',
    url: '/lab/login',
    headers: origin,
    payload: { username, password: pass },
  });
}
function cookie(response: { headers: Record<string, unknown> }) {
  const values = response.headers['set-cookie'];
  return (Array.isArray(values) ? values : [values])
    .filter(Boolean)
    .map((v) => String(v).split(';')[0])
    .join('; ');
}
const me = (value: string) =>
  server.inject({ remoteAddress: source, url: '/lab/me', headers: { cookie: value } });

beforeAll(async () => {
  await migrate(pool);
  const before = await pool.query(
    'select count(*)::int as total from auth_poc_migrations.__drizzle_migrations',
  );
  await migrate(pool);
  const after = await pool.query(
    'select count(*)::int as total from auth_poc_migrations.__drizzle_migrations',
  );
  expect(after.rows[0].total).toBe(before.rows[0].total);
});
afterAll(async () => {
  await server.close();
  await pool.end();
});

describe('Better Auth, Drizzle e PostgreSQL reais', () => {
  it('aplica migração idempotente e usa PostgreSQL 17', async () => {
    const version = await pool.query('show server_version_num');
    expect(Number(version.rows[0].server_version_num)).toBeGreaterThanOrEqual(170000);
    expect(Number(version.rows[0].server_version_num)).toBeLessThan(180000);
  });
  it('cria sem e-mail pessoal e garante unicidade canônica concorrente', async () => {
    const username = name();
    const results = await Promise.allSettled([
      lab.createIdentity({ username, password }),
      lab.createIdentity({ username: username.toUpperCase(), password }),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const response = await login(username.toUpperCase());
    expect(response.statusCode).toBe(200);
    expect((await me(cookie(response))).json()).toMatchObject({ username });
    expect((await me(cookie(response))).body).not.toContain('@');
  });
  it('revoga sessão no backend, inclusive em nova instância do laboratório', async () => {
    const user = await identity();
    const response = await login(user.username);
    const credentials = cookie(response);
    expect(response.headers['set-cookie']?.toString()).toMatch(/HttpOnly/i);
    expect(response.headers['set-cookie']?.toString()).toMatch(/SameSite=Lax/i);
    expect((await me(credentials)).statusCode).toBe(200);
    expect(
      (
        await server.inject({
          remoteAddress: source,
          method: 'POST',
          url: '/lab/logout',
          headers: { ...origin, cookie: credentials },
          payload: {},
        })
      ).statusCode,
    ).toBe(200);
    const restarted = buildServer(createLab({ pool, secret, baseURL, now }), baseURL);
    expect(
      (
        await restarted.inject({
          remoteAddress: source,
          url: '/lab/me',
          headers: { cookie: credentials },
        })
      ).statusCode,
    ).toBe(401);
    await restarted.close();
  });
  it('não renova sessão com atividade e recusa expiração na borda', async () => {
    const user = await identity();
    const response = await login(user.username);
    const before = await pool.query('select "expiresAt" from auth_poc.session where "userId"=$1', [
      user.id,
    ]);
    vi.useFakeTimers({ toFake: ['Date'] });
    try {
      vi.setSystemTime(Date.now() + 2 * 86400000);
      expect((await me(cookie(response))).statusCode).toBe(200);
      const expiry = new Date(before.rows[0].expiresAt).getTime();
      vi.setSystemTime(expiry - 1);
      expect((await me(cookie(response))).statusCode).toBe(200);
      vi.setSystemTime(expiry);
      expect((await me(cookie(response))).statusCode).toBe(401);
    } finally {
      vi.useRealTimers();
    }
    const after = await pool.query('select "expiresAt" from auth_poc.session where "userId"=$1', [
      user.id,
    ]);
    expect(after.rows[0].expiresAt).toEqual(before.rows[0].expiresAt);
    const duration = new Date(before.rows[0].expiresAt).getTime() - Date.now();
    expect(duration).toBeGreaterThan(7 * 86400000 - 10000);
    expect(duration).toBeLessThanOrEqual(7 * 86400000);
    await pool.query(
      'update auth_poc.session set "expiresAt"=now() - interval \'1 millisecond\' where "userId"=$1',
      [user.id],
    );
    expect((await me(cookie(response))).statusCode).toBe(401);
  });
  it('troca autenticada exige senha atual e mantém só a sessão atual', async () => {
    const user = await identity();
    const first = cookie(await login(user.username));
    const second = cookie(await login(user.username));
    const change = (currentPassword: string) =>
      server.inject({
        remoteAddress: source,
        method: 'POST',
        url: '/lab/change-password',
        headers: { ...origin, cookie: first },
        payload: { currentPassword, newPassword: 'new-password' },
      });
    expect((await change('wrong-password')).statusCode).toBe(400);
    const deadline = (
      await pool.query(
        'select "expiresAt" from auth_poc.session where "userId"=$1 order by "createdAt" limit 1',
        [user.id],
      )
    ).rows[0].expiresAt;
    const changed = await change(password);
    expect(changed.statusCode).toBe(200);
    expect((await me(cookie(changed))).statusCode).toBe(200);
    expect((await me(second)).statusCode).toBe(401);
    expect(
      (await pool.query('select "expiresAt" from auth_poc.session where "userId"=$1', [user.id]))
        .rows[0].expiresAt,
    ).toEqual(deadline);
  });
  it('recuperação autoriza somente administrador global para outra conta', async () => {
    const target = await identity();
    for (const role of ['member', 'core-admin'] as const) {
      const actor = await identity(role);
      const credentials = cookie(await login(actor.username));
      expect(
        (
          await server.inject({
            remoteAddress: source,
            method: 'POST',
            url: '/lab/recovery',
            headers: { ...origin, cookie: credentials },
            payload: { userId: target.id },
          })
        ).statusCode,
      ).toBe(403);
    }
    const actor = await identity('global-admin');
    const credentials = cookie(await login(actor.username));
    const response = await server.inject({
      remoteAddress: source,
      method: 'POST',
      url: '/lab/recovery',
      headers: { ...origin, cookie: credentials },
      payload: { userId: target.id },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().link).toMatch(/^http:\/\/127\.0\.0\.1:5505\/#recover=/);
    expect(
      (
        await server.inject({
          remoteAddress: source,
          method: 'POST',
          url: '/lab/recovery',
          headers: { ...origin, cookie: credentials },
          payload: { userId: actor.id },
        })
      ).statusCode,
    ).toBe(403);
  });
  it('reemissão invalida token, uso concorrente só troca uma vez e revoga todas as sessões', async () => {
    const user = await identity('global-admin');
    const sessions = [cookie(await login(user.username)), cookie(await login(user.username))];
    const first = await lab.issueRecovery({ kind: 'operator' }, user.id);
    const second = await lab.issueRecovery({ kind: 'operator' }, user.id);
    await expect(lab.reset(first.token, 'new-password')).rejects.toThrow();
    const results = await Promise.allSettled([
      lab.reset(second.token, 'new-password'),
      lab.reset(second.token, 'other-password'),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    for (const credentials of sessions) expect((await me(credentials)).statusCode).toBe(401);
    await expect(lab.reset(second.token, 'new-password')).rejects.toThrow();
    expect(
      (
        await login(
          user.username,
          results[0]!.status === 'fulfilled' ? 'new-password' : 'other-password',
        )
      ).statusCode,
    ).toBe(200);
  });
  it('rollback mantém senha, token e sessões se revogação falhar', async () => {
    const user = await identity('global-admin');
    const credentials = cookie(await login(user.username));
    const recovery = await lab.issueRecovery({ kind: 'operator' }, user.id);
    await pool.query(
      `create or replace function auth_poc.refuse_delete() returns trigger language plpgsql as $$ begin raise exception 'test fault'; end $$`,
    );
    await pool.query(
      'create trigger refuse_session_delete before delete on auth_poc.session for each row execute function auth_poc.refuse_delete()',
    );
    try {
      await expect(lab.reset(recovery.token, 'new-password')).rejects.toThrow();
    } finally {
      await pool.query('drop trigger refuse_session_delete on auth_poc.session');
    }
    expect((await me(credentials)).statusCode).toBe(200);
    expect((await login(user.username)).statusCode).toBe(200);
    await lab.reset(recovery.token, 'new-password');
  });
  it('expira recuperação em 30 min e limita emissões e senhas inválidas', async () => {
    const user = await identity('global-admin');
    const first = await lab.issueRecovery({ kind: 'operator' }, user.id);
    time += 30 * 60000;
    await expect(lab.reset(first.token, 'new-password')).rejects.toThrow();
    const second = await lab.issueRecovery({ kind: 'operator' }, user.id);
    for (let i = 0; i < 5; i++) await expect(lab.reset(second.token, 'short')).rejects.toThrow();
    await expect(lab.reset(second.token, 'new-password')).rejects.toThrow();
    await lab.issueRecovery({ kind: 'operator' }, user.id);
    await expect(lab.issueRecovery({ kind: 'operator' }, user.id)).rejects.toThrow();
    time += 3600001;
    await expect(lab.issueRecovery({ kind: 'operator' }, user.id)).resolves.toBeDefined();
  });
  it('suspende conta por 15 min após cinco falhas, sem revogar sessão válida', async () => {
    const user = await identity();
    const credentials = cookie(await login(user.username));
    for (let i = 0; i < 5; i++)
      expect((await login(user.username, 'wrong-password')).statusCode).toBe(401);
    expect((await login(user.username)).statusCode).toBe(429);
    const restarted = buildServer(createLab({ pool, secret, baseURL, now }), baseURL);
    expect(
      (
        await restarted.inject({
          remoteAddress: source,
          method: 'POST',
          url: '/lab/login',
          headers: origin,
          payload: { username: user.username, password },
        })
      ).statusCode,
    ).toBe(429);
    await restarted.close();
    expect((await me(credentials)).statusCode).toBe(200);
    time += 15 * 60000;
    expect((await login(user.username)).statusCode).toBe(200);
  });
  it('limita origem entre contas e consultas de recuperação, ignora X-Forwarded-For', async () => {
    time += 60001;
    for (let i = 0; i < 60; i++) await login(name(), 'wrong-password');
    expect((await login(name())).statusCode).toBe(429);
    expect(
      (
        await server.inject({
          remoteAddress: source,
          method: 'POST',
          url: '/lab/login',
          headers: { ...origin, 'x-forwarded-for': '203.0.113.1' },
          payload: { username: name(), password },
        })
      ).statusCode,
    ).toBe(429);
    for (let i = 0; i < 30; i++)
      await server.inject({
        remoteAddress: source,
        method: 'POST',
        url: '/lab/reset',
        headers: origin,
        payload: { token: randomUUID(), newPassword: password },
      });
    expect(
      (
        await server.inject({
          remoteAddress: source,
          method: 'POST',
          url: '/lab/reset',
          headers: origin,
          payload: { token: randomUUID(), newPassword: password },
        })
      ).statusCode,
    ).toBe(429);
  });
  it('não expõe rotas nativas, rejeita CSRF/origens e não vaza segredos em erro', async () => {
    for (const endpoint of [
      'sign-up/email',
      'sign-in/email',
      'request-password-reset',
      'reset-password',
      'update-user',
      'change-email',
    ]) {
      expect(
        (
          await server.inject({
            remoteAddress: source,
            method: 'POST',
            url: '/api/auth/' + endpoint,
            headers: origin,
            payload: {},
          })
        ).statusCode,
      ).toBe(404);
    }
    for (const headers of [
      {},
      { origin: 'https://evil.invalid' },
      { ...origin, 'sec-fetch-site': 'cross-site' },
    ]) {
      expect(
        (
          await server.inject({
            remoteAddress: source,
            method: 'POST',
            url: '/lab/login',
            headers,
            payload: { username: name(), password },
          })
        ).statusCode,
      ).toBe(403);
    }
    const response = await server.inject({
      remoteAddress: source,
      method: 'POST',
      url: '/lab/login',
      headers: origin,
      payload: { username: 'bad@username', password: 'secret-password' },
    });
    expect(response.body).not.toContain('secret-password');
    const audit = await pool.query('select action, actor, target from auth_poc.audit');
    expect(JSON.stringify(audit.rows)).not.toMatch(
      /poc-password|new-password|recover=|session_token/,
    );
  });
  it('bootstrap é de uso único, expira, reemite e impede duas criações concorrentes', async () => {
    await pool.query('delete from auth_poc.bootstrap');
    const first = await lab.issueBootstrap();
    const second = await lab.issueBootstrap();
    await expect(lab.bootstrap(first, { username: name(), password })).rejects.toThrow();
    time += 30 * 60000;
    await expect(lab.bootstrap(second, { username: name(), password })).rejects.toThrow();
    const third = await lab.issueBootstrap();
    const results = await Promise.allSettled([
      lab.bootstrap(third, { username: name(), password }),
      lab.bootstrap(third, { username: name(), password }),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    await expect(lab.issueBootstrap()).rejects.toThrow();
  });
  it('comando local emite recuperação só para administrador global, sem senha em argv', async () => {
    const user = await identity('global-admin');
    const invoke = (username: string) =>
      execFileSync(process.execPath, ['--import', 'tsx', 'src/operator.ts', 'recover', username], {
        env: { ...process.env, POC_AUTH_SECRET: secret, POC_ORIGIN: baseURL },
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    const output = JSON.parse(invoke(user.username)) as { link: string };
    expect(output.link.startsWith(baseURL + '/#recover=')).toBe(true);
    const token = decodeURIComponent(output.link.split('#recover=')[1]!);
    await createLab({ pool, secret, baseURL }).reset(token, 'local-new-password');
    const member = await identity();
    expect(() => invoke(member.username)).toThrow();
    await expect(lab.issueRecovery({ kind: 'operator' }, member.id)).rejects.toThrow();
  });
  it('valida o corpo HTTP e recusa identidade administrativa enviada pelo cliente', async () => {
    const malformed = [
      { username: name() },
      { username: name(), password, role: 'global-admin' },
      { username: [], password },
    ];
    for (const payload of malformed) {
      const result = await server.inject({
        remoteAddress: source,
        method: 'POST',
        url: '/lab/login',
        headers: origin,
        payload,
      });
      expect(result.statusCode).toBe(400);
      expect(result.body).not.toContain(password);
    }
    for (const userId of [randomUUID(), (await identity()).id]) {
      expect(
        (
          await server.inject({
            remoteAddress: source,
            method: 'POST',
            url: '/lab/recovery',
            headers: origin,
            payload: { userId },
          })
        ).statusCode,
      ).toBe(401);
    }
  });
});
