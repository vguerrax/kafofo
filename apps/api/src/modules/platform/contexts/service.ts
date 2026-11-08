import { randomUUID } from 'node:crypto';
import type pg from 'pg';
import { authAdapter } from '../auth/adapter.js';
import type { AuthConfig } from '../auth/config.js';
import { createTransactions } from '../auth/transaction.js';
import { AuthError, unauthenticated } from '../auth/policies.js';
import { recordSecurity } from '../audit/record.js';
import {
  contextName,
  canManageAccess,
  forbidden,
  notFound,
  type CoreRole,
  type ResidenceRole,
} from './policies.js';
interface Core {
  id: string;
  name: string;
}
interface Residence extends Core {
  coreId: string;
}
interface Membership {
  id: string;
  role: CoreRole;
  userId: string;
}
interface Access {
  id: string;
  role: ResidenceRole;
  userId: string;
  name: string;
}
export function createContextService(options: AuthConfig & { pool: pg.Pool; now?: () => number }) {
  const tx = createTransactions(options.pool),
    now = options.now ?? Date.now;
  async function session(c: pg.PoolClient, headers: Headers) {
    const a = await authAdapter(c, options).api.getSession({ headers });
    if (!a || !a.user.username || a.session.expiresAt.getTime() <= now()) throw unauthenticated();
    return a;
  }
  async function membership(c: pg.PoolClient, coreId: string, userId: string) {
    return (
      await c.query<Membership>(
        'select id,role,"userId" from platform.core_memberships where "coreId"=$1 and "userId"=$2 and "revokedAt" is null',
        [coreId, userId],
      )
    ).rows[0];
  }
  async function access(c: pg.PoolClient, residenceId: string, membershipId: string) {
    return (
      await c.query<{ id: string; role: ResidenceRole }>(
        'select id,role from platform.residence_accesses where "residenceId"=$1 and "membershipId"=$2 and "revokedAt" is null',
        [residenceId, membershipId],
      )
    ).rows[0];
  }
  async function run<T>(
    headers: Headers,
    coreId: string | null,
    residenceId: string | null,
    fn: (
      c: pg.PoolClient,
      userId: string,
      m: Membership | undefined,
      r: Residence | undefined,
    ) => Promise<T>,
  ) {
    const initial = await tx.run(null, async (c) => {
      const a = await session(c, headers);
      const r = residenceId
        ? (
            await c.query<Residence>(
              'select id,"coreId",name from platform.residences where id=$1',
              [residenceId],
            )
          ).rows[0]
        : undefined;
      if (residenceId && !r) throw notFound();
      return { username: a.user.username, coreId: r?.coreId ?? coreId };
    });
    return tx.run('account:' + initial.username, async (c) => {
      if (initial.coreId)
        await c.query('select pg_advisory_xact_lock(hashtext($1))', ['core:' + initial.coreId]);
      if (residenceId)
        await c.query('select pg_advisory_xact_lock(hashtext($1))', ['residence:' + residenceId]);
      const a = await session(c, headers);
      const m = initial.coreId ? await membership(c, initial.coreId, a.user.id) : undefined;
      if (initial.coreId && !m) throw notFound();
      const r = residenceId
        ? (
            await c.query<Residence>(
              'select id,"coreId",name from platform.residences where id=$1',
              [residenceId],
            )
          ).rows[0]
        : undefined;
      if (residenceId && !r) throw notFound();
      return fn(c, a.user.id, m, r);
    });
  }
  const coreInfo = (row: Core & { role: CoreRole }) => ({
    ...row,
    canManageMembers: row.role === 'admin',
    canCreateResidence: row.role === 'admin',
  });
  const residenceInfo = (r: Residence, role: ResidenceRole | null, admin: boolean) => ({
    ...r,
    role,
    canManageResponsible: admin,
    canManageAccesses: role === 'responsible',
  });
  async function contexts(headers: Headers) {
    return run(headers, null, null, async (c, id) => {
      const cs = (
        await c.query<Core & { role: CoreRole }>(
          'select c.id,c.name,m.role from platform.cores c join platform.core_memberships m on m."coreId"=c.id where m."userId"=$1 and m."revokedAt" is null order by c."createdAt",c.id',
          [id],
        )
      ).rows;
      const rs = (
        await c.query<Residence & { role: ResidenceRole; coreRole: CoreRole }>(
          'select r.id,r.name,r."coreId",a.role,m.role as "coreRole" from platform.residences r join platform.core_memberships m on m."coreId"=r."coreId" and m."userId"=$1 and m."revokedAt" is null join platform.residence_accesses a on a."residenceId"=r.id and a."membershipId"=m.id and a."revokedAt" is null order by r."createdAt",r.id',
          [id],
        )
      ).rows;
      return {
        cores: cs.map(coreInfo),
        residences: rs.map(({ coreRole, role, ...r }) =>
          residenceInfo(r, role, coreRole === 'admin'),
        ),
      };
    });
  }
  async function createCore(headers: Headers, name: string) {
    const valid = contextName(name);
    return run(headers, null, null, async (c, id) => {
      const core = { id: randomUUID(), name: valid };
      const membershipId = randomUUID();
      await c.query('insert into platform.cores(id,name) values($1,$2)', [core.id, core.name]);
      await c.query(
        'insert into platform.core_memberships(id,"coreId","userId",role) values($1,$2,$3,\'admin\')',
        [membershipId, core.id, id],
      );
      await recordSecurity(c, {
        action: 'membership.created',
        actorId: id,
        targetId: id,
        coreId: core.id,
        membershipId,
        nextRole: 'admin',
      });
      return coreInfo({ ...core, role: 'admin' });
    });
  }
  async function createResidence(
    headers: Headers,
    coreId: string,
    input: { name: string; responsibleUserId: string },
  ) {
    const name = contextName(input.name);
    return run(headers, coreId, null, async (c, actor, m) => {
      if (m!.role !== 'admin') throw forbidden();
      const target = await membership(c, coreId, input.responsibleUserId);
      if (!target)
        throw new AuthError(400, 'INVALID_MEMBER', 'Escolha um membro ativo deste núcleo.');
      const r = { id: randomUUID(), coreId, name };
      const residenceAccessId = randomUUID();
      await c.query('insert into platform.residences(id,"coreId",name) values($1,$2,$3)', [
        r.id,
        coreId,
        name,
      ]);
      await c.query(
        'insert into platform.residence_accesses(id,"coreId","residenceId","membershipId",role) values($1,$2,$3,$4,\'responsible\')',
        [residenceAccessId, coreId, r.id, target.id],
      );
      await recordSecurity(c, {
        action: 'residence-access.created',
        actorId: actor,
        targetId: target.userId,
        coreId,
        residenceId: r.id,
        membershipId: target.id,
        residenceAccessId,
        nextRole: 'responsible',
      });
      return r;
    });
  }
  async function residences(headers: Headers, coreId: string) {
    return run(headers, coreId, null, async (c, _id, m) => {
      const rows = (
        await c.query<Residence & { role: ResidenceRole | null }>(
          'select r.id,r.name,r."coreId",a.role from platform.residences r left join platform.residence_accesses a on a."residenceId"=r.id and a."membershipId"=$2 and a."revokedAt" is null where r."coreId"=$1 and ($3 or a.id is not null) order by r."createdAt",r.id',
          [coreId, m!.id, m!.role === 'admin'],
        )
      ).rows;
      return rows.map(({ role, ...r }) => residenceInfo(r, role, m!.role === 'admin'));
    });
  }
  async function residence(headers: Headers, id: string) {
    return run(headers, null, id, async (c, _user, m, r) => {
      const a = await access(c, id, m!.id);
      if (!a) throw notFound();
      return residenceInfo(r!, a.role, m!.role === 'admin');
    });
  }
  async function members(headers: Headers, coreId: string) {
    return run(headers, coreId, null, async (c, _id, m) => {
      const responsible = (
        await c.query(
          'select id from platform.residence_accesses where "membershipId"=$1 and role=\'responsible\' and "revokedAt" is null limit 1',
          [m!.id],
        )
      ).rowCount;
      if (m!.role !== 'admin' && !responsible) throw forbidden();
      return (
        await c.query<{ id: string; userId: string; name: string; role: CoreRole }>(
          'select m.id,m."userId",u.name,m.role from platform.core_memberships m join platform."user" u on u.id=m."userId" where m."coreId"=$1 and m."revokedAt" is null order by m."createdAt",m.id',
          [coreId],
        )
      ).rows;
    });
  }
  async function accesses(headers: Headers, id: string) {
    return run(headers, null, id, async (c, _user, m) => {
      const own = await access(c, id, m!.id);
      if (m!.role !== 'admin' && own?.role !== 'responsible') throw forbidden();
      return (
        await c.query<Access>(
          'select a.id,a.role,m."userId",u.name from platform.residence_accesses a join platform.core_memberships m on m.id=a."membershipId" and m."revokedAt" is null join platform."user" u on u.id=m."userId" where a."residenceId"=$1 and a."revokedAt" is null order by a."createdAt",a.id',
          [id],
        )
      ).rows;
    });
  }
  async function changeAccess(
    headers: Headers,
    id: string,
    userId: string,
    next: ResidenceRole | null,
  ) {
    return run(headers, null, id, async (c, actor, m, r) => {
      const target = await membership(c, r!.coreId, userId);
      if (!target)
        throw new AuthError(400, 'INVALID_MEMBER', 'Escolha um membro ativo deste núcleo.');
      const current = await access(c, id, target.id),
        own = await access(c, id, m!.id);
      if (
        !canManageAccess(
          m!.role === 'admin',
          own?.role === 'responsible',
          current?.role ?? null,
          next,
        )
      )
        throw forbidden();
      if ((!current && !next) || current?.role === next) return;
      const residenceAccessId = current?.id ?? randomUUID();
      if (current) {
        if (next)
          await c.query(
            'update platform.residence_accesses set role=$2,"updatedAt"=now() where id=$1',
            [current.id, next],
          );
        else
          await c.query(
            'update platform.residence_accesses set "revokedAt"=now(),"updatedAt"=now() where id=$1',
            [current.id],
          );
      } else if (next)
        await c.query(
          'insert into platform.residence_accesses(id,"coreId","residenceId","membershipId",role) values($1,$2,$3,$4,$5)',
          [residenceAccessId, r!.coreId, id, target.id, next],
        );
      await recordSecurity(c, {
        action: !next
          ? 'residence-access.revoked'
          : current
            ? 'residence-access.role-changed'
            : 'residence-access.created',
        actorId: actor,
        targetId: userId,
        coreId: r!.coreId,
        residenceId: id,
        membershipId: target.id,
        residenceAccessId,
        ...(current ? { previousRole: current.role } : {}),
        ...(next ? { nextRole: next } : {}),
      });
    });
  }
  async function changeMember(
    headers: Headers,
    coreId: string,
    userId: string,
    next: CoreRole | null,
  ) {
    return run(headers, coreId, null, async (c, actor, m) => {
      if (m!.role !== 'admin' && !(next === null && actor === userId)) throw forbidden();
      const target = await membership(c, coreId, userId);
      if (!target) throw notFound();
      if (target.role === 'admin' && next !== 'admin') {
        const total = (
          await c.query<{ total: number }>(
            'select count(*)::int total from platform.core_memberships where "coreId"=$1 and role=\'admin\' and "revokedAt" is null',
            [coreId],
          )
        ).rows[0]!.total;
        if (total === 1)
          throw new AuthError(409, 'LAST_ADMIN', 'O núcleo precisa manter um administrador ativo.');
      }
      if (target.role === next) return;
      if (next)
        await c.query(
          'update platform.core_memberships set role=$2,"updatedAt"=now() where id=$1',
          [target.id, next],
        );
      else {
        const revoked = await c.query<{ id: string; residenceId: string; role: ResidenceRole }>(
          'update platform.residence_accesses set "revokedAt"=now(),"updatedAt"=now() where "membershipId"=$1 and "revokedAt" is null returning id,"residenceId",role',
          [target.id],
        );
        for (const access of revoked.rows)
          await recordSecurity(c, {
            action: 'residence-access.revoked',
            actorId: actor,
            targetId: userId,
            coreId,
            residenceId: access.residenceId,
            membershipId: target.id,
            residenceAccessId: access.id,
            previousRole: access.role,
          });
        await c.query(
          'update platform.core_memberships set "revokedAt"=now(),"updatedAt"=now() where id=$1',
          [target.id],
        );
      }
      await recordSecurity(c, {
        action: next ? 'membership.role-changed' : 'membership.revoked',
        actorId: actor,
        targetId: userId,
        coreId,
        membershipId: target.id,
        previousRole: target.role,
        ...(next ? { nextRole: next } : {}),
      });
    });
  }
  return {
    contexts,
    createCore,
    createResidence,
    residences,
    residence,
    members,
    accesses,
    setAccess: (h: Headers, r: string, u: string, role: ResidenceRole) =>
      changeAccess(h, r, u, role),
    removeAccess: (h: Headers, r: string, u: string) => changeAccess(h, r, u, null),
    setMemberRole: (h: Headers, c: string, u: string, role: CoreRole) =>
      changeMember(h, c, u, role),
    removeMember: (h: Headers, c: string, u: string) => changeMember(h, c, u, null),
  };
}
export type ContextService = ReturnType<typeof createContextService>;
