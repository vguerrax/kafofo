import type pg from 'pg';
import type { AuthConfig } from './config.js';
import { authAdapter } from './adapter.js';
import { createBootstrap } from './bootstrap.js';
import { createTransactions } from './transaction.js';
import {
  AuthError,
  canonicalUsername,
  unauthenticated,
  unavailable,
  validatePassword,
} from './policies.js';
import { blocked, consumeOrigin, fail, readLimit, writeLimit } from './limits.js';

export function createAuthService(options: AuthConfig & { pool: pg.Pool; now?: () => number }) {
  const transactions = createTransactions(options.pool);
  const now = options.now ?? Date.now;
  const setup = createBootstrap(options, transactions, now);
  async function session(client: pg.PoolClient, headers: Headers) {
    const result = await authAdapter(client, options).api.getSession({ headers });
    return result && result.session.expiresAt.getTime() > now() ? result : null;
  }
  async function rate(source: string, kind: 'login' | 'setup') {
    const key = kind + '-origin:' + source;
    await transactions.run('limit:' + key, (client) =>
      consumeOrigin(client, key, kind === 'login' ? 60 : 10, now()),
    );
  }
  function unwrap<T>(result: T | AuthError): T {
    // Falhas esperadas que alteram contadores são lançadas somente depois do commit.
    if (result instanceof AuthError) throw result;
    return result;
  }
  const getSession = (headers: Headers) =>
    transactions.run(null, (client) => session(client, headers));
  async function login(
    input: { username: string; password: string },
    headers: Headers,
    source: string,
  ) {
    await rate(source, 'login');
    let username: string;
    try {
      username = canonicalUsername(input.username);
    } catch {
      throw new AuthError(401, 'INVALID_CREDENTIALS', 'Usuário ou senha incorretos.');
    }
    const result = await transactions.run('account:' + username, async (client) => {
      const key = 'login-account:' + username;
      const state = await readLimit(client, key);
      const suspension = blocked(state, now());
      if (suspension) return suspension;
      const response = await authAdapter(client, options).api.signInUsername({
        headers,
        body: { username, password: input.password },
        asResponse: true,
      });
      if (response.ok) {
        await client.query('delete from platform.auth_limits where key=$1', [key]);
        return response;
      }
      if (response.status >= 500) throw unavailable();
      return (
        (await fail(client, key, state, now())) ??
        new AuthError(401, 'INVALID_CREDENTIALS', 'Usuário ou senha incorretos.')
      );
    });
    return unwrap(result);
  }
  async function logout(headers: Headers) {
    const active = await getSession(headers);
    return transactions.run(active ? 'account:' + active.user.username : null, async (client) => {
      // signOut é idempotente e limpa os cookies mesmo quando a sessão já foi revogada.
      const response = await authAdapter(client, options).api.signOut({
        headers,
        asResponse: true,
      });
      if (!response.ok) throw unavailable();
      return response;
    });
  }
  async function changePassword(headers: Headers, currentPassword: string, newPassword: string) {
    const passwordLimit = (error: AuthError) =>
      new AuthError(
        429,
        'PASSWORD_CHANGE_BLOCKED',
        'Troca de senha bloqueada por 15 minutos. Aguarde antes de tentar novamente.',
        error.retryAfter,
      );
    const active = await getSession(headers);
    if (!active) throw unauthenticated();
    const result = await transactions.run('account:' + active.user.username, async (client) => {
      const current = await session(client, headers);
      if (!current) throw unauthenticated();
      const key = 'password-account:' + current.user.id;
      const state = await readLimit(client, key);
      const suspension = blocked(state, now());
      if (suspension) return passwordLimit(suspension);
      const adapter = authAdapter(client, options);
      const verified = await adapter.api.verifyPassword({
        headers,
        body: { password: currentPassword },
        asResponse: true,
      });
      if (!verified.ok) {
        if (verified.status >= 500) throw unavailable();
        const limit = await fail(client, key, state, now());
        if (limit) {
          await client.query('delete from platform.session where "userId"=$1', [current.user.id]);
          const cleared = await adapter.api.signOut({ headers, asResponse: true });
          return { error: passwordLimit(limit), cookies: cleared.headers.getSetCookie() };
        }
        return new AuthError(400, 'INVALID_CURRENT_PASSWORD', 'Senha atual incorreta.');
      }
      await writeLimit(client, key, { events: [], blockedUntil: 0 }, now());
      try {
        validatePassword(newPassword);
      } catch (error) {
        if (error instanceof AuthError) return error;
        throw error;
      }
      const response = await adapter.api.changePassword({
        headers,
        body: { currentPassword, newPassword, revokeOtherSessions: true },
        asResponse: true,
      });
      if (!response.ok) throw unavailable();
      await client.query(
        'update platform.session set "expiresAt"=$1,"createdAt"=$2 where "userId"=$3',
        [current.session.expiresAt, current.session.createdAt, current.user.id],
      );
      return { response, deadline: current.session.expiresAt };
    });
    if (result instanceof AuthError) throw result;
    if ('error' in result) return result;
    // A rotação não pode alongar o prazo do cookie, além do prazo no banco.
    const responseHeaders = new Headers(result.response.headers);
    responseHeaders.delete('set-cookie');
    for (const value of result.response.headers.getSetCookie()) {
      let cookie = value;
      if (/^[^=]*session_token=/.test(cookie)) {
        cookie = cookie.replace(/; Max-Age=[^;]*/gi, '').replace(/; Expires=[^;]*/gi, '');
        cookie +=
          '; Max-Age=' +
          Math.max(0, Math.floor((result.deadline.getTime() - now()) / 1000)) +
          '; Expires=' +
          result.deadline.toUTCString();
      }
      responseHeaders.append('set-cookie', cookie);
    }
    return { response: new Response(null, { status: 200, headers: responseHeaders }) };
  }
  async function cleanup() {
    await transactions.run('auth:cleanup', async (client) => {
      await client.query(
        'delete from platform.auth_limits where key in (select key from platform.auth_limits where "expiresAt"<=$1 and "blockedUntil"<=$1 order by "expiresAt" limit 500 for update skip locked)',
        [now()],
      );
      for (const table of ['session', 'verification'] as const) {
        await client.query(
          `delete from platform.${table} where id in (select id from platform.${table} where "expiresAt"<=$1 order by "expiresAt" limit 500 for update skip locked)`,
          [new Date(now())],
        );
      }
      await client.query(
        'update platform.auth_setup set digest=null,"expiresAt"=null where id in (select id from platform.auth_setup where not configured and "expiresAt"<=$1 for update skip locked)',
        [new Date(now())],
      );
    });
  }
  async function confirmExportPassword(headers: Headers, password: string, source: string) {
    const active = await getSession(headers);
    if (!active?.user.username) throw unauthenticated();
    const originKey = 'export-origin:' + source;
    await transactions.run('limit:' + originKey, (c) => consumeOrigin(c, originKey, 30, now()));
    const exportLimit = (error: AuthError) =>
      new AuthError(
        429,
        'EXPORT_BLOCKED',
        'Muitas tentativas de exportação. Aguarde antes de tentar novamente.',
        error.retryAfter,
      );
    const result = await transactions.run('account:' + active.user.username, async (c) => {
      const current = await session(c, headers);
      if (!current?.user.username) throw unauthenticated();
      const key = 'export-password-account:' + current.user.id;
      const state = await readLimit(c, key);
      const suspension = blocked(state, now());
      if (suspension) return exportLimit(suspension);
      const verified = await authAdapter(c, options).api.verifyPassword({
        headers,
        body: { password },
        asResponse: true,
      });
      if (!verified.ok) {
        if (verified.status >= 500) throw unavailable();
        const limit = await fail(c, key, state, now());
        return limit
          ? exportLimit(limit)
          : new AuthError(400, 'INVALID_CURRENT_PASSWORD', 'Senha atual incorreta.');
      }
      await c.query('delete from platform.auth_limits where key=$1', [key]);
      // Referências internas verificadas pelo adaptador; nunca são parte do arquivo.
      return {
        userId: current.user.id,
        sessionId: current.session.id,
        token: current.session.token,
      };
    });
    return unwrap(result);
  }
  let timer: ReturnType<typeof setInterval> | undefined;
  let cleaning: Promise<void> | undefined;
  function startCleanup(onError: () => void) {
    const run = () => {
      if (!cleaning)
        cleaning = cleanup()
          .catch(onError)
          .finally(() => {
            cleaning = undefined;
          });
    };
    run();
    timer = setInterval(run, 60000);
    timer.unref();
  }
  async function close() {
    if (timer) clearInterval(timer);
    await cleaning;
  }
  return {
    getSession,
    ...setup,
    rate,
    login,
    logout,
    changePassword,
    confirmExportPassword,
    cleanup,
    startCleanup,
    close,
  };
}
export type AuthService = ReturnType<typeof createAuthService>;
