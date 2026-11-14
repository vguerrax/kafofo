import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type pg from 'pg';
import { createAuth, createIdentity, type AuthOptions } from './auth.js';
import { transaction } from './database/client.js';
import { canonicalUsername, LabError, validatePassword } from './policies.js';
import { consumeLimit, readLimit, writeLimit } from './limits.js';

const digest = (value: string) => createHash('sha256').update(value).digest('hex');
type Actor = { kind: 'operator' } | { kind: 'admin'; headers: Headers };
export function createLab(options: AuthOptions & { pool: pg.Pool; now?: () => number }) {
  const { pool } = options;
  const now = options.now ?? Date.now;
  const auth = createAuth(pool, options);
  const audit = (client: pg.PoolClient, action: string, actor: string, target: string) =>
    client.query('insert into auth_poc.audit(id,action,actor,target) values($1,$2,$3,$4)', [
      randomUUID(),
      action,
      actor,
      target,
    ]);
  async function rate(key: string, count: number, window: number) {
    await transaction(pool, 'limit:' + key, (client) =>
      consumeLimit(client, key, count, window, now()),
    );
  }
  async function getSession(headers: Headers, client: pg.Pool | pg.PoolClient = pool) {
    const active = await createAuth(client, options).api.getSession({ headers });
    if (!active || active.session.expiresAt.getTime() <= Date.now()) return null;
    return active;
  }
  async function issueRecovery(actor: Actor, userId: string) {
    const targetName = (
      await pool.query('select username from auth_poc."user" where id=$1', [userId])
    ).rows[0]?.username;
    return transaction(pool, 'account:' + targetName, async (client) => {
      const session = actor.kind === 'admin' ? await getSession(actor.headers, client) : null;
      if (actor.kind === 'admin' && !session) throw new LabError(401, 'UNAUTHENTICATED');
      if (
        actor.kind === 'admin' &&
        (session?.user.role !== 'global-admin' || session.user.id === userId)
      )
        throw new LabError(403, 'FORBIDDEN');
      const target = (
        await client.query('select id,email,role from auth_poc."user" where id=$1', [userId])
      ).rows[0];
      if (!target) throw new LabError(404, 'NOT_FOUND');
      let actorId = 'local-operator';
      if (actor.kind === 'admin') {
        actorId = session!.user.id;
      } else if (target.role !== 'global-admin') throw new LabError(403, 'FORBIDDEN');
      await consumeLimit(client, 'recovery-issue:' + userId, 3, 3600000, now());
      let token: string | undefined;
      const scoped = createAuth(client, {
        ...options,
        onReset: (value) => {
          token = value;
        },
      });
      await client.query('update auth_poc.recovery set used=true where "userId"=$1', [userId]);
      await client.query(
        "delete from auth_poc.verification where value=$1 and identifier like 'reset-password:%'",
        [userId],
      );
      await scoped.api.requestPasswordReset({
        body: { email: target.email, redirectTo: options.baseURL },
      });
      if (!token) throw new LabError(500, 'ISSUE_FAILED');
      await client.query(
        'insert into auth_poc.recovery(digest,"userId","expiresAt") values($1,$2,$3)',
        [digest(token), userId, now() + 1800000],
      );
      await audit(client, 'recovery-issued', actorId, userId);
      return { token, link: options.baseURL + '/#recover=' + encodeURIComponent(token) };
    });
  }
  async function reset(token: string, newPassword: string) {
    if (typeof token !== 'string' || token.length > 256)
      throw new LabError(400, 'INVALID_RECOVERY');
    const record = (
      await pool.query(
        'select r."userId",u.username from auth_poc.recovery r join auth_poc."user" u on u.id=r."userId" where r.digest=$1',
        [digest(token)],
      )
    ).rows[0];
    if (!record) throw new LabError(400, 'INVALID_RECOVERY');
    const outcome = await transaction(pool, 'account:' + record.username, async (client) => {
      const current = (
        await client.query('select * from auth_poc.recovery where digest=$1', [digest(token)])
      ).rows[0];
      if (!current || current.used || Number(current.expiresAt) <= now())
        return new LabError(400, 'INVALID_RECOVERY');
      try {
        validatePassword(newPassword);
      } catch {
        await client.query(
          'update auth_poc.recovery set failures=failures+1,used=(failures+1>=5) where digest=$1',
          [digest(token)],
        );
        return new LabError(400, 'INVALID_PASSWORD');
      }
      await createAuth(client, options).api.resetPassword({ body: { token, newPassword } });
      await client.query('update auth_poc.recovery set used=true where digest=$1', [digest(token)]);
      await audit(client, 'recovery-used', current.userId, current.userId);
      return undefined;
    });
    if (outcome instanceof LabError) throw outcome;
  }
  async function login(
    input: { username: string; password: string },
    headers: Headers,
    source: string,
  ) {
    await rate('login-origin:' + source, 60, 60000);
    const username = canonicalUsername(input.username);
    return transaction(pool, 'account:' + username, async (client) => {
      const key = 'login-account:' + username;
      const state = await readLimit(client, key);
      if (state.blockedUntil > now()) throw new LabError(429, 'TRY_LATER');
      const response = await createAuth(client, options).api.signInUsername({
        headers,
        body: { username, password: input.password },
        asResponse: true,
      });
      if (response.ok) await writeLimit(client, key, { events: [], blockedUntil: 0 });
      else {
        const events = [...state.events.filter((t) => t > now() - 900000), now()];
        await writeLimit(client, key, {
          events,
          blockedUntil: events.length >= 5 ? now() + 900000 : 0,
        });
      }
      return response;
    });
  }
  async function issueBootstrap() {
    return transaction(pool, 'bootstrap', async (client) => {
      const record = (await client.query('select consumed from auth_poc.bootstrap where id=1'))
        .rows[0];
      if (record?.consumed) throw new LabError(403, 'ALREADY_CONFIGURED');
      const token = randomBytes(32).toString('hex');
      await client.query(
        'insert into auth_poc.bootstrap(id,digest,"expiresAt") values(1,$1,$2) on conflict(id) do update set digest=$1,"expiresAt"=$2',
        [digest(token), now() + 1800000],
      );
      return token;
    });
  }
  async function changePassword(headers: Headers, currentPassword: string, newPassword: string) {
    validatePassword(newPassword);
    const active = await getSession(headers);
    if (!active) throw new LabError(401, 'UNAUTHENTICATED');
    return transaction(pool, 'account:' + active.user.username, async (client) => {
      if (!(await getSession(headers, client))) throw new LabError(401, 'UNAUTHENTICATED');
      const response = await createAuth(client, options).api.changePassword({
        headers,
        body: { currentPassword, newPassword, revokeOtherSessions: true },
        asResponse: true,
      });
      if (!response.ok) return response;
      // Better Auth rotates the current cookie. Keep its original absolute login deadline.
      await client.query(
        'update auth_poc.session set "expiresAt"=$1,"createdAt"=$2 where "userId"=$3',
        [active.session.expiresAt, active.session.createdAt, active.user.id],
      );
      return response;
    });
  }
  async function bootstrap(token: string, input: { username: string; password: string }) {
    return transaction(pool, 'bootstrap', async (client) => {
      const record = (await client.query('select * from auth_poc.bootstrap where id=1')).rows[0];
      if (
        !record ||
        record.consumed ||
        record.digest !== digest(token) ||
        Number(record.expiresAt) <= now()
      )
        throw new LabError(400, 'INVALID_BOOTSTRAP');
      const user = await createIdentity(client, options, { ...input, role: 'global-admin' });
      await client.query('update auth_poc.bootstrap set consumed=true where id=1');
      await audit(client, 'bootstrap-used', 'local-operator', user.id);
      return user;
    });
  }
  return {
    auth,
    getSession,
    login,
    issueRecovery,
    reset,
    issueBootstrap,
    changePassword,
    bootstrap,
    rate,
    createIdentity: (input: Parameters<typeof createIdentity>[2]) =>
      transaction(pool, 'create:' + canonicalUsername(input.username), (client) =>
        createIdentity(client, options, input),
      ),
  };
}
export type Lab = ReturnType<typeof createLab>;
