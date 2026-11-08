import { randomUUID } from 'node:crypto';
import { residenceCandidates, type PlatformAccessOptions } from '../platform/public.js';
import { AuthError } from '../platform/public.js';
import {
  createListAccess,
  listInfo,
  listVisibility,
  listForbidden,
  type ListRow,
} from './access.js';
import { listFields } from './policies.js';
export function createKitandaService(options: PlatformAccessOptions) {
  const { scope, run } = createListAccess(options);
  return {
    collection: (headers: Headers, residenceId: string) =>
      scope(headers, residenceId, null, async (c, a) => {
        const rows = (
          await c.query<ListRow>(
            'select l.* from kitanda.lists l where l."residenceId"=$1 and ' +
              listVisibility +
              ' order by l."createdAt",l.id',
            [residenceId, a.userId, a.residenceAccessId],
          )
        ).rows;
        return rows.map((r) => listInfo(r, a));
      }),
    create: (
      headers: Headers,
      residenceId: string,
      input: { name: string; description?: string },
    ) =>
      scope(headers, residenceId, null, async (c, a) => {
        if (a.role === 'viewer') throw listForbidden();
        const fields = listFields(input);
        const row = (
          await c.query<ListRow>(
            'insert into kitanda.lists(id,"residenceId","creatorId",name,description) values($1,$2,$3,$4,$5) returning *',
            [randomUUID(), residenceId, a.userId, fields.name, fields.description ?? null],
          )
        ).rows[0]!;
        return listInfo(row, a);
      }),
    detail: (h: Headers, id: string) => run(h, id, 'read', async (_c, a, r) => listInfo(r, a)),
    update: (h: Headers, id: string, input: { name?: string; description?: string }) =>
      run(h, id, 'write', async (c, a, r) => {
        const fields = listFields(input);
        const row = (
          await c.query<ListRow>(
            'update kitanda.lists set name=$2,description=$3,"updatedAt"=now() where id=$1 returning *',
            [
              id,
              fields.name ?? r.name,
              fields.description === undefined ? r.description : fields.description,
            ],
          )
        ).rows[0]!;
        return listInfo(row, a);
      }),
    candidates: (h: Headers, id: string) =>
      run(h, id, 'manage', async (c, _a, r) => {
        return residenceCandidates(c, r.residenceId, r.creatorId);
      }),
    shares: (h: Headers, id: string) =>
      run(h, id, 'manage', async (c, _a, r) => {
        const candidates = await residenceCandidates(c, r.residenceId, r.creatorId);
        const rows = (
          await c.query<{ id: string; residenceAccessId: string }>(
            'select id,"residenceAccessId" from kitanda.list_shares where "listId"=$1 and "revokedAt" is null order by "createdAt",id',
            [r.id],
          )
        ).rows;
        return rows.flatMap((s) => {
          const target = candidates.find((t) => t.id === s.residenceAccessId);
          return target ? [{ ...s, name: target.name }] : [];
        });
      }),
    share: (h: Headers, id: string, accessId: string) =>
      run(h, id, 'manage', async (c, _a, r) => {
        if (
          !(await residenceCandidates(c, r.residenceId, r.creatorId)).some((a) => a.id === accessId)
        )
          throw new AuthError(
            400,
            'INVALID_SHARE_TARGET',
            'Escolha uma pessoa com acesso ativo a esta residência.',
          );
        await c.query(
          'insert into kitanda.list_shares(id,"listId","residenceId","residenceAccessId") values($1,$2,$3,$4) on conflict("listId","residenceAccessId") where "revokedAt" is null do nothing',
          [randomUUID(), r.id, r.residenceId, accessId],
        );
      }),
    revoke: (h: Headers, id: string, accessId: string) =>
      run(h, id, 'manage', async (c, _a, r) => {
        await c.query(
          'update kitanda.list_shares set "revokedAt"=now() where "listId"=$1 and "residenceId"=$2 and "residenceAccessId"=$3 and "revokedAt" is null',
          [r.id, r.residenceId, accessId],
        );
      }),
  };
}
export type KitandaService = ReturnType<typeof createKitandaService>;
