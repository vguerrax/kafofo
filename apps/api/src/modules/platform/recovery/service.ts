import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type pg from 'pg';
import type { AuthConfig } from '../auth/config.js';
import { authAdapter, resetIdentityPassword } from '../auth/adapter.js';
import {
  AuthError,
  canonicalUsername,
  unauthenticated,
  validatePassword,
  limited,
} from '../auth/policies.js';
import { createTransactions } from '../auth/transaction.js';
import { consumeOrigin, readLimit, writeLimit } from '../auth/limits.js';
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const unavailable = () => new AuthError(404, 'RECOVERY_UNAVAILABLE', 'Recuperação indisponível.');
const forbidden = () => new AuthError(403, 'FORBIDDEN', 'Operação não permitida.');
type Actor = { kind: 'admin'; headers: Headers } | { kind: 'operator'; identity: string };
interface Recovery {
  id: string;
  userId: string;
  username: string;
  expiresAt: Date;
  revokedAt: Date | null;
  consumedAt: Date | null;
  failures: number;
  channel: 'admin' | 'operator';
}
export function createRecoveryService(options: AuthConfig & { pool: pg.Pool; now?: () => number }) {
  const tx = createTransactions(options.pool),
    now = options.now ?? Date.now;
  async function session(c: pg.PoolClient, headers: Headers) {
    const s = await authAdapter(c, options).api.getSession({ headers });
    if (!s?.user.username || s.session.expiresAt.getTime() <= now()) throw unauthenticated();
    return s;
  }
  async function event(
    c: pg.PoolClient,
    action: 'issued' | 'used',
    actor: string,
    target: string,
    channel: 'admin' | 'operator',
  ) {
    await c.query(
      'insert into platform.recovery_events(id,action,actor,target,channel,"createdAt") values($1,$2,$3,$4,$5,$6)',
      [randomUUID(), action, actor, target, channel, new Date(now())],
    );
  }
  async function lookup(c: pg.PoolClient, token: string) {
    const row = (
      await c.query<Recovery>(
        'select r.*,u.username from platform.password_recoveries r join platform."user" u on u.id=r."userId" where digest=$1',
        [digest(token)],
      )
    ).rows[0];
    if (!row) throw unavailable();
    return row;
  }
  function valid(r: Recovery) {
    if (r.revokedAt || r.consumedAt || r.expiresAt.getTime() <= now() || r.failures >= 5)
      throw unavailable();
  }
  async function issue(actor: Actor, targetName: string) {
    const username = canonicalUsername(targetName);
    const initial =
      actor.kind === 'admin' ? await tx.run(null, (c) => session(c, actor.headers)) : null;
    if (initial && !initial.user.globalAdmin) throw forbidden();
    // Ordem lexical de contas evita ciclos entre dois administradores globais.
    const keys = [...new Set([username, ...(initial ? [initial.user.username!] : [])])].sort();
    return tx.run('account:' + keys[0], async (c) => {
      for (const key of keys.slice(1))
        await c.query('select pg_advisory_xact_lock(hashtext($1))', ['account:' + key]);
      const current = actor.kind === 'admin' ? await session(c, actor.headers) : null;
      if (current && !current.user.globalAdmin) throw forbidden();
      const target = (
        await c.query<{ id: string; globalAdmin: boolean }>(
          'select id,"globalAdmin" from platform."user" where username=$1',
          [username],
        )
      ).rows[0];
      if (!target) throw new AuthError(404, 'NOT_FOUND', 'Conta não encontrada.');
      if (current?.user.id === target.id || (actor.kind === 'operator' && !target.globalAdmin))
        throw forbidden();
      if (actor.kind === 'operator' && (!actor.identity || actor.identity.length > 128))
        throw forbidden();
      const key = 'recovery-issue:' + target.id,
        state = await readLimit(c, key),
        events = state.events.filter((t) => t > now() - 3600000);
      if (events.length >= 3) throw limited((events[0]! + 3600000 - now()) / 1000);
      await writeLimit(c, key, { events: [...events, now()], blockedUntil: 0 }, now() + 3600000);
      await c.query(
        'update platform.password_recoveries set "revokedAt"=$2 where "userId"=$1 and "revokedAt" is null and "consumedAt" is null',
        [target.id, new Date(now())],
      );
      const token = randomBytes(32).toString('base64url'),
        expiresAt = new Date(now() + 1800000);
      await c.query(
        'insert into platform.password_recoveries(id,digest,"userId","createdAt","expiresAt",channel) values($1,$2,$3,$4,$5,$6)',
        [randomUUID(), digest(token), target.id, new Date(now()), expiresAt, actor.kind],
      );
      await event(
        c,
        'issued',
        current ? current.user.id : (actor as Extract<Actor, { kind: 'operator' }>).identity,
        target.id,
        actor.kind,
      );
      return { link: options.baseURL + '/#recover=' + token, expiresAt: expiresAt.toISOString() };
    });
  }
  async function preview(token: string) {
    return tx.run(null, async (c) => {
      valid(await lookup(c, token));
      return { valid: true as const };
    });
  }
  async function complete(token: string, newPassword: string) {
    const initial = await tx.run(null, (c) => lookup(c, token));
    const result = await tx.run('account:' + initial.username, async (c) => {
      const r = await lookup(c, token);
      valid(r);
      try {
        validatePassword(newPassword);
      } catch (e) {
        if (!(e instanceof AuthError)) throw e;
        await c.query(
          'update platform.password_recoveries set failures=failures+1,"revokedAt"=case when failures+1>=5 then $2 else "revokedAt" end where id=$1',
          [r.id, new Date(now())],
        );
        return e;
      }
      await resetIdentityPassword(c, options, r.userId, newPassword);
      await c.query('delete from platform.session where "userId"=$1', [r.userId]);
      await c.query('update platform.password_recoveries set "consumedAt"=$2 where id=$1', [
        r.id,
        new Date(now()),
      ]);
      await event(c, 'used', r.userId, r.userId, r.channel);
      return null;
    });
    if (result) throw result;
  }
  async function rate(source: string, operation: 'preview' | 'complete' | 'issue') {
    const key = 'recovery-' + operation + '-origin:' + source;
    await tx.run('limit:' + key, (c) => consumeOrigin(c, key, 30, now()));
  }
  return { issue, preview, complete, rate };
}
export type RecoveryService = ReturnType<typeof createRecoveryService>;
