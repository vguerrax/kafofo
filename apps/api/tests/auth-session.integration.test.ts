import { Writable } from 'node:stream';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { fixture, password, origin, cookie, username, baseURL } from './auth-fixture.js';
import { createAuthService } from '../src/modules/platform/auth/service.js';
import { buildApp } from '../src/app.js';
import { createLogger } from '../src/logger.js';

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
const login = (name: string, pass = password, address = '127.0.0.1') =>
  f.app.inject({
    remoteAddress: address,
    method: 'POST',
    url: '/api/auth/login',
    headers: origin,
    payload: { username: name, password: pass },
  });
const me = (credentials: string) =>
  f.app.inject({ url: '/api/auth/session', headers: { cookie: credentials } });
const change = (
  credentials: string,
  currentPassword = password,
  newPassword = 'changed-password',
) =>
  f.app.inject({
    method: 'POST',
    url: '/api/auth/password',
    headers: { ...origin, cookie: credentials },
    payload: { currentPassword, newPassword },
  });

describe('sessões e proteção de tentativas', () => {
  it('revalida sessão depois do lock quando logout concorre com troca', async () => {
    const user = await f.identity();
    const credentials = cookie(await login(user.username));
    const locker = await f.database.pool.connect();
    const key = 'account:' + user.username;
    await locker.query('begin');
    await locker.query('select pg_advisory_xact_lock(hashtext($1))', [key]);
    let loggedOut: ReturnType<typeof f.app.inject> | undefined;
    let changed: ReturnType<typeof change> | undefined;
    const waitFor = async (minimum: number) => {
      const deadline = Date.now() + 700;
      while (Date.now() < deadline) {
        const waiting = await f.database.pool.query(
          "select count(*)::int as total from pg_locks where locktype='advisory' and not granted",
        );
        if (waiting.rows[0].total >= minimum) return;
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      throw new Error('requisição não aguardou o lock');
    };
    try {
      loggedOut = f.app.inject({
        method: 'POST',
        url: '/api/auth/logout',
        headers: { ...origin, cookie: credentials },
        payload: {},
      });
      void loggedOut.then(() => undefined);
      await waitFor(1);
      changed = change(credentials);
      void changed.then(() => undefined);
      await waitFor(2);
    } finally {
      await locker.query('rollback');
      locker.release();
    }
    expect((await loggedOut!).statusCode).toBe(204);
    expect((await changed!).statusCode).toBe(401);
    expect((await login(user.username)).statusCode).toBe(200);
  });
  it('nega sem sessão, autentica sem e-mail e logout revoga no backend', async () => {
    expect((await me('')).statusCode).toBe(401);
    const user = await f.identity();
    const response = await login(user.username.toUpperCase());
    expect(response.statusCode).toBe(200);
    const credentials = cookie(response);
    expect(response.headers['set-cookie']?.toString()).toMatch(/HttpOnly.*SameSite=Lax/i);
    expect((await me(credentials)).json()).toMatchObject({
      user: { id: user.id, username: user.username, globalAdmin: false },
    });
    expect((await me(credentials)).body).not.toMatch(/identity\.invalid|session_token|password/);
    expect(
      (
        await f.app.inject({
          method: 'POST',
          url: '/api/auth/logout',
          headers: { ...origin, cookie: credentials },
          payload: {},
        })
      ).statusCode,
    ).toBe(204);
    expect(
      await createAuthService(f.options).getSession(new Headers({ cookie: credentials })),
    ).toBeNull();
    expect((await me(credentials)).statusCode).toBe(401);
    expect(
      (
        await f.app.inject({
          method: 'POST',
          url: '/api/auth/logout',
          headers: origin,
          payload: {},
        })
      ).statusCode,
    ).toBe(204);
  });
  it('sete dias absolutos, sem renovação e com expiração no instante exato', async () => {
    const user = await f.identity();
    const credentials = cookie(await login(user.username));
    const initial = (
      await f.database.pool.query('select "createdAt","expiresAt" from platform.session')
    ).rows[0];
    expect(initial.expiresAt.getTime() - initial.createdAt.getTime()).toBe(7 * 86400000);
    f.advance(2 * 86400000);
    expect((await me(credentials)).statusCode).toBe(200);
    expect(
      (await f.database.pool.query('select "expiresAt" from platform.session')).rows[0].expiresAt,
    ).toEqual(initial.expiresAt);
    f.setTime(initial.expiresAt.getTime() - 1);
    expect((await me(credentials)).statusCode).toBe(200);
    f.advance(1);
    expect((await me(credentials)).statusCode).toBe(401);
  });
  it('troca conserva prazo absoluto, exige senha atual e revoga outros navegadores', async () => {
    const user = await f.identity();
    const first = cookie(await login(user.username));
    const second = cookie(await login(user.username));
    const deadline = (await me(first)).json().expiresAt;
    expect((await change(first, password, 'bad password')).statusCode).toBe(400);
    expect((await change(first, 'wrong')).statusCode).toBe(400);
    const response = await change(first);
    expect(response.statusCode).toBe(204);
    expect((await me(cookie(response))).json().expiresAt).toBe(deadline);
    expect((await me(second)).statusCode).toBe(401);
    expect((await login(user.username, 'changed-password')).statusCode).toBe(200);
    expect((await login(user.username)).statusCode).toBe(401);
  });
  it('quinta falha de troca persiste bloqueio, revoga todas e sobrevive a login e reinício', async () => {
    const user = await f.identity();
    const first = cookie(await login(user.username));
    const second = cookie(await login(user.username));
    for (let i = 0; i < 4; i++)
      expect((await change(i % 2 ? first : second, 'wrong')).statusCode).toBe(400);
    const fifth = await change(first, 'wrong');
    expect(fifth.statusCode).toBe(429);
    expect(fifth.headers['retry-after']).toBe('900');
    expect(fifth.headers['set-cookie']?.toString()).toContain('Max-Age=0');
    for (const credentials of [first, second]) expect((await me(credentials)).statusCode).toBe(401);
    const renewed = cookie(await login(user.username));
    const restarted = createAuthService(f.options);
    await expect(
      restarted.changePassword(new Headers({ cookie: renewed }), password, 'new-password'),
    ).rejects.toMatchObject({ status: 429 });
    expect((await me(renewed)).statusCode).toBe(200);
    f.advance(899999);
    expect((await change(renewed)).statusCode).toBe(429);
    f.advance(1);
    expect((await change(renewed)).statusCode).toBe(204);
  });
  it('login e troca têm contadores independentes e login suspenso preserva sessão', async () => {
    const user = await f.identity();
    const credentials = cookie(await login(user.username));
    for (let i = 0; i < 4; i++) expect((await change(credentials, 'wrong')).statusCode).toBe(400);
    for (let i = 0; i < 4; i++) expect((await login(user.username, 'wrong')).statusCode).toBe(401);
    expect((await login(user.username)).statusCode).toBe(200);
    expect((await change(credentials, 'wrong')).statusCode).toBe(429);
    const fresh = cookie(await login(user.username));
    for (let i = 0; i < 5; i++)
      expect((await login(user.username, 'wrong')).statusCode).toBe(i === 4 ? 429 : 401);
    expect((await me(fresh)).statusCode).toBe(200);
    expect((await change(fresh)).statusCode).toBe(429);
    f.advance(900000);
    expect((await login(user.username)).statusCode).toBe(200);
  });
  it('verifica senha atual antes da nova e acerto limpa falhas de troca', async () => {
    const user = await f.identity();
    const credentials = cookie(await login(user.username));
    for (let i = 0; i < 4; i++)
      expect((await change(credentials, 'wrong', 'x')).statusCode).toBe(400);
    expect((await change(credentials, password, 'x')).statusCode).toBe(400);
    expect((await change(credentials, 'wrong', 'x')).statusCode).toBe(400);
    expect((await change(credentials)).statusCode).toBe(204);
  });
  it('cinco trocas concorrentes compartilham contador sem perder revogações', async () => {
    const user = await f.identity();
    const credentials = cookie(await login(user.username));
    const results = await Promise.all(
      Array.from({ length: 5 }, () => change(credentials, 'wrong')),
    );
    expect(results.filter((r) => r.statusCode === 400)).toHaveLength(4);
    expect(results.filter((r) => r.statusCode === 429)).toHaveLength(1);
    expect((await me(credentials)).statusCode).toBe(401);
  });
  it('rollback da troca não muda senha/sessões nem entrega cookie', async () => {
    const user = await f.identity();
    const first = cookie(await login(user.username));
    const second = cookie(await login(user.username));
    await f.database.pool.query(
      "create or replace function platform.test_refuse_delete() returns trigger language plpgsql as $$ begin raise exception 'injected'; end $$",
    );
    await f.database.pool.query(
      'create trigger test_refuse_delete before delete on platform.session for each row execute function platform.test_refuse_delete()',
    );
    try {
      const failed = await change(first);
      expect(failed.statusCode).toBe(503);
      expect(failed.headers['set-cookie']).toBeUndefined();
    } finally {
      await f.database.pool.query('drop trigger test_refuse_delete on platform.session');
    }
    expect((await me(first)).statusCode).toBe(200);
    expect((await me(second)).statusCode).toBe(200);
    expect((await login(user.username)).statusCode).toBe(200);
  });
  it('limita 60 tentativas entre contas e ignora cabeçalho de proxy não confiável', async () => {
    for (let i = 0; i < 60; i++) expect((await login(username(), 'wrong')).statusCode).toBe(401);
    const limited = await f.app.inject({
      method: 'POST',
      url: '/api/auth/login',
      headers: { ...origin, 'x-forwarded-for': '203.0.113.8' },
      payload: { username: username(), password },
    });
    expect(limited.statusCode).toBe(429);
    f.advance(60000);
    expect((await login(username(), 'wrong')).statusCode).toBe(401);
  });
  it('limpeza limitada preserva instalação concluída e bloqueios vigentes', async () => {
    const code = await f.auth.issueBootstrap();
    await f.auth.bootstrap(code, { username: username(), password });
    const user = await f.identity();
    const credentials = cookie(await login(user.username));
    for (let i = 0; i < 5; i++) await change(credentials, 'wrong');
    await f.database.pool.query(
      'insert into platform.auth_limits(key,events,"blockedUntil","expiresAt") select \'old-\'||n,\'[]\'::jsonb,0,0 from generate_series(1,600) n',
    );
    await f.auth.cleanup();
    expect(
      Number(
        (
          await f.database.pool.query(
            "select count(*) from platform.auth_limits where key like 'old-%'",
          )
        ).rows[0].count,
      ),
    ).toBe(100);
    await f.auth.cleanup();
    expect((await f.app.inject('/api/auth/setup')).json()).toEqual({ configured: true });
    const renewed = cookie(await login(user.username));
    expect((await change(renewed)).statusCode).toBe(429);
    f.advance(900000);
    await f.auth.cleanup();
    expect((await change(renewed)).statusCode).toBe(204);
  });
});

describe('superfície HTTP e segredos', () => {
  it('usa somente a cadeia de proxy explicitamente confiável', async () => {
    const trusted = await buildApp({
      auth: f.auth,
      authOrigin: baseURL,
      trustedProxies: ['127.0.0.1/32'],
    });
    try {
      for (let i = 0; i < 60; i++) {
        await trusted.inject({
          method: 'POST',
          url: '/api/auth/login',
          remoteAddress: '127.0.0.1',
          headers: { ...origin, 'x-forwarded-for': '203.0.113.7' },
          payload: { username: username(), password: 'wrong' },
        });
      }
      const attempt = (peer: string, forwarded: string) =>
        trusted.inject({
          method: 'POST',
          url: '/api/auth/login',
          remoteAddress: peer,
          headers: { ...origin, 'x-forwarded-for': forwarded },
          payload: { username: username(), password: 'wrong' },
        });
      expect((await attempt('127.0.0.1', '203.0.113.7')).statusCode).toBe(429);
      expect((await attempt('127.0.0.1', '203.0.113.8')).statusCode).toBe(401);
      // Um hop não confiável interrompe a cadeia; o valor à esquerda não é identidade confiável.
      expect((await attempt('127.0.0.1', '198.51.100.9, 203.0.113.7')).statusCode).toBe(429);
      expect((await attempt('198.51.100.5', '203.0.113.7')).statusCode).toBe(401);
    } finally {
      await trusted.close();
    }
  });
  it('recusa CSRF, corpos inesperados e endpoints nativos alternativos', async () => {
    for (const headers of [
      {},
      { origin: 'https://evil.invalid' },
      { ...origin, 'sec-fetch-site': 'cross-site' },
    ]) {
      expect(
        (
          await f.app.inject({
            method: 'POST',
            url: '/api/auth/login',
            headers,
            payload: { username: username(), password },
          })
        ).statusCode,
      ).toBe(403);
    }
    for (const payload of [
      { username: 'ana' },
      { username: 'ana', password, globalAdmin: true },
      { username: [], password },
    ]) {
      expect(
        (await f.app.inject({ method: 'POST', url: '/api/auth/login', headers: origin, payload }))
          .statusCode,
      ).toBe(400);
    }
    for (const path of [
      'sign-up/email',
      'sign-in/email',
      'sign-in/username',
      'request-password-reset',
      'reset-password',
      'change-password',
      'update-user',
      'change-email',
      'get-session',
      'sign-out',
      '../auth/sign-up/email',
      'sign-up%2Femail',
    ]) {
      for (const method of ['GET', 'POST'] as const)
        expect(
          (await f.app.inject({ method, url: '/api/auth/' + path, headers: origin })).statusCode,
        ).toBe(404);
    }
  });
  it('mantém 503 quando autenticação não está configurada', async () => {
    const app = await buildApp();
    try {
      expect((await app.inject('/api/auth/setup')).statusCode).toBe(503);
      expect((await app.inject('/api/health')).statusCode).toBe(200);
    } finally {
      await app.close();
    }
  });
  it('não vaza senha/código/cookie/token nos erros ou logs', async () => {
    const lines: string[] = [];
    const logger = createLogger(
      'info',
      new Writable({
        write(chunk: Buffer, _encoding, callback) {
          lines.push(chunk.toString());
          callback();
        },
      }),
    );
    const app = await buildApp({ auth: f.auth, authOrigin: baseURL, logger });
    try {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/setup?token=secret-url-marker',
        headers: { ...origin, cookie: 'secret-cookie-marker' },
        payload: {
          code: 'secret-code-marker',
          username: 'bad@name',
          password: 'secret-password-marker',
        },
      });
      expect(response.body + lines.join('')).not.toMatch(
        /secret-(url|cookie|code|password)-marker/,
      );
      expect(response.headers['cache-control']).toBe('no-store');
    } finally {
      await app.close();
    }
  });
});
