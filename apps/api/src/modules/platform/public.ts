// Contrato de integração entre módulos: escopo atual e serialização com a plataforma.
import type pg from 'pg';
import { authAdapter } from './auth/adapter.js';
import { createTransactions } from './auth/transaction.js';
import { unauthenticated } from './auth/policies.js';
import { notFound } from './contexts/policies.js';
export { user } from './auth/schema.js';
export { residences, residenceAccesses } from './contexts/schema.js';
export interface ResidenceActor {
  userId: string;
  residenceId: string;
  residenceName: string;
  residenceAccessId: string;
  role: 'responsible' | 'collaborator' | 'viewer';
}
export interface PlatformAccessOptions {
  pool: pg.Pool;
  secret: string;
  baseURL: string;
  now?: () => number;
}
export function createResidenceScope(options: PlatformAccessOptions) {
  const tx = createTransactions(options.pool),
    now = options.now ?? Date.now;
  async function session(c: pg.PoolClient, headers: Headers) {
    const s = await authAdapter(c, options).api.getSession({ headers });
    if (!s?.user.username || s.session.expiresAt.getTime() <= now()) throw unauthenticated();
    return s;
  }
  return async function run<T>(
    headers: Headers,
    locate: string | ((c: pg.PoolClient) => Promise<string>),
    listId: string | null,
    operation: (c: pg.PoolClient, actor: ResidenceActor) => Promise<T>,
  ) {
    const initial = await tx.run(null, async (c) => {
      const s = await session(c, headers),
        residenceId = typeof locate === 'string' ? locate : await locate(c);
      const r = (
        await c.query<{ coreId: string }>('select "coreId" from platform.residences where id=$1', [
          residenceId,
        ])
      ).rows[0];
      if (!r) throw notFound();
      return { username: s.user.username, residenceId, coreId: r.coreId };
    });
    return tx.run('account:' + initial.username, async (c) => {
      for (const key of [
        'core:' + initial.coreId,
        'residence:' + initial.residenceId,
        ...(listId ? ['list:' + listId] : []),
      ])
        await c.query('select pg_advisory_xact_lock(hashtext($1))', [key]);
      const s = await session(c, headers);
      const a = (
        await c.query<{ id: string; role: ResidenceActor['role']; residenceName: string }>(
          'select a.id,a.role,r.name as "residenceName" from platform.residence_accesses a join platform.core_memberships m on m.id=a."membershipId" and m."coreId"=a."coreId" join platform.residences r on r.id=a."residenceId" and r."coreId"=m."coreId" where a."residenceId"=$1 and m."userId"=$2 and a."revokedAt" is null and m."revokedAt" is null',
          [initial.residenceId, s.user.id],
        )
      ).rows[0];
      if (!a) throw notFound();
      return operation(c, {
        userId: s.user.id,
        residenceId: initial.residenceId,
        residenceName: a.residenceName,
        residenceAccessId: a.id,
        role: a.role,
      });
    });
  };
}

export { AuthError, unavailable } from './auth/policies.js';
export async function residenceCandidates(
  c: pg.PoolClient,
  residenceId: string,
  excludeUserId: string,
) {
  return (
    await c.query<{ id: string; name: string }>(
      'select a.id,u.name from platform.residence_accesses a join platform.core_memberships m on m.id=a."membershipId" and m."coreId"=a."coreId" and m."revokedAt" is null join platform."user" u on u.id=m."userId" where a."residenceId"=$1 and a."revokedAt" is null and u.id<>$2 order by u.name,a.id',
      [residenceId, excludeUserId],
    )
  ).rows;
}
export { createTransactions } from './auth/transaction.js';
