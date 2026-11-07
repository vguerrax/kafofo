import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type pg from 'pg';
import { authAdapter, createIdentity } from '../auth/adapter.js';
import type { AuthConfig } from '../auth/config.js';
import {
  AuthError,
  canonicalUsername,
  unauthenticated,
  validatePassword,
} from '../auth/policies.js';
import { createTransactions } from '../auth/transaction.js';
import { consumeOrigin } from '../auth/limits.js';
import { forbidden, notFound } from '../contexts/policies.js';
const digest = (token: string) => createHash('sha256').update(token).digest('hex');
const unavailable = () => new AuthError(404, 'INVITATION_UNAVAILABLE', 'Convite indisponível.');
interface Invitation {
  id: string;
  coreId: string;
  name: string;
  expiresAt: Date;
  consumedAt: Date | null;
  revokedAt: Date | null;
}
export function createInvitationService(
  options: AuthConfig & { pool: pg.Pool; now?: () => number },
) {
  const tx = createTransactions(options.pool),
    now = options.now ?? Date.now;
  async function session(c: pg.PoolClient, headers: Headers) {
    const s = await authAdapter(c, options).api.getSession({ headers });
    if (!s?.user.username || s.session.expiresAt.getTime() <= now()) throw unauthenticated();
    return s;
  }
  async function lock(c: pg.PoolClient, key: string) {
    await c.query('select pg_advisory_xact_lock(hashtext($1))', [key]);
  }
  async function admin<T>(
    headers: Headers,
    coreId: string,
    fn: (c: pg.PoolClient, id: string) => Promise<T>,
  ) {
    const initial = await tx.run(null, (c) => session(c, headers));
    return tx.run('account:' + initial.user.username, async (c) => {
      await lock(c, 'core:' + coreId);
      const s = await session(c, headers);
      const m = (
        await c.query(
          'select role from platform.core_memberships where "coreId"=$1 and "userId"=$2 and "revokedAt" is null',
          [coreId, s.user.id],
        )
      ).rows[0];
      if (!m) throw notFound();
      if (m.role !== 'admin') throw forbidden();
      return fn(c, s.user.id);
    });
  }
  async function lookup(c: pg.PoolClient, token: string) {
    const row = (
      await c.query<Invitation>(
        'select i.*,c.name from platform.invitations i join platform.cores c on c.id=i."coreId" where digest=$1',
        [digest(token)],
      )
    ).rows[0];
    if (!row) throw unavailable();
    return row;
  }
  function valid(i: Invitation) {
    if (i.revokedAt || i.consumedAt || i.expiresAt.getTime() <= now()) throw unavailable();
  }
  async function preview(token: string) {
    return tx.run(null, async (c) => {
      const i = await lookup(c, token);
      valid(i);
      return { name: i.name };
    });
  }
  async function acceptTransaction(
    token: string,
    headers: Headers | null,
    input?: { username: string; password: string },
  ) {
    const initial = headers ? await tx.run(null, (c) => session(c, headers)) : null;
    const username = initial?.user.username ?? canonicalUsername(input!.username);
    if (input) validatePassword(input.password);
    return tx.run('account:' + username, async (c) => {
      const found = await lookup(c, token);
      await lock(c, 'core:' + found.coreId);
      await lock(c, 'invitation:' + found.id);
      const i = await lookup(c, token);
      valid(i);
      let userId: string;
      if (headers) userId = (await session(c, headers)).user.id;
      else {
        if (
          (await c.query('select id from platform."user" where username=$1', [username])).rowCount
        )
          throw new AuthError(409, 'USERNAME_IN_USE', 'Usuário já está em uso.');
        userId = (await createIdentity(c, options, input!)).id;
      }
      const existing = (
        await c.query(
          'select id from platform.core_memberships where "coreId"=$1 and "userId"=$2 and "revokedAt" is null',
          [i.coreId, userId],
        )
      ).rowCount;
      if (existing) return { coreId: i.coreId, alreadyMember: true };
      await c.query(
        'insert into platform.core_memberships(id,"coreId","userId",role) values($1,$2,$3,\'member\')',
        [randomUUID(), i.coreId, userId],
      );
      await c.query('update platform.invitations set "consumedAt"=$2 where id=$1', [
        i.id,
        new Date(now()),
      ]);
      return { coreId: i.coreId, alreadyMember: false };
    });
  }
  return {
    preview,
    accept: (headers: Headers, token: string) => acceptTransaction(token, headers),
    register: (token: string, input: { username: string; password: string }) =>
      acceptTransaction(token, null, input),
    async rate(source: string, registration = false) {
      const key = 'invitation-origin:' + source;
      await tx.run('limit:' + key, (c) => consumeOrigin(c, key, 60, now()));
      if (registration) {
        const k = 'invitation-register:' + source;
        await tx.run('limit:' + k, (c) => consumeOrigin(c, k, 10, now()));
      }
    },
    issue: (headers: Headers, coreId: string) =>
      admin(headers, coreId, async (c, userId) => {
        const token = randomBytes(32).toString('base64url'),
          id = randomUUID(),
          createdAt = new Date(now()),
          expiresAt = new Date(now() + 7 * 86400000);
        await c.query(
          'insert into platform.invitations(id,"coreId","issuerId",digest,"createdAt","expiresAt") values($1,$2,$3,$4,$5,$6)',
          [id, coreId, userId, digest(token), createdAt, expiresAt],
        );
        return {
          id,
          link: options.baseURL + '/#invite=' + token,
          expiresAt: expiresAt.toISOString(),
        };
      }),
    list: (headers: Headers, coreId: string) =>
      admin(headers, coreId, async (c) => {
        const rows = (
          await c.query<Invitation & { createdAt: Date; issuerId: string }>(
            'select id,"coreId","issuerId","createdAt","expiresAt","consumedAt","revokedAt" from platform.invitations where "coreId"=$1 order by "createdAt" desc,id',
            [coreId],
          )
        ).rows;
        return rows.map((i) => ({
          id: i.id,
          issuerId: i.issuerId,
          createdAt: i.createdAt.toISOString(),
          expiresAt: i.expiresAt.toISOString(),
          state: i.consumedAt
            ? ('consumed' as const)
            : i.revokedAt
              ? ('revoked' as const)
              : i.expiresAt.getTime() <= now()
                ? ('expired' as const)
                : ('active' as const),
        }));
      }),
    revoke: (headers: Headers, coreId: string, id: string) =>
      admin(headers, coreId, async (c) => {
        await lock(c, 'invitation:' + id);
        const i = (
          await c.query<Invitation>(
            'select * from platform.invitations where id=$1 and "coreId"=$2',
            [id, coreId],
          )
        ).rows[0];
        if (!i) throw notFound();
        if (i.consumedAt) throw new AuthError(409, 'INVITATION_CONSUMED', 'Convite já utilizado.');
        if (!i.revokedAt)
          await c.query('update platform.invitations set "revokedAt"=$2 where id=$1', [
            id,
            new Date(now()),
          ]);
      }),
  };
}
export type InvitationService = ReturnType<typeof createInvitationService>;
