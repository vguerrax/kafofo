import { confirm, receiptMaintenance } from './receipts.js';
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
import { createLifecycleService } from './lifecycle.js';
import { createHistoryService } from './history.js';
import { changes, recordHistory } from './history-record.js';
export function createKitandaService(options: PlatformAccessOptions) {
  const { scope, run } = createListAccess(options);
  const receipts = receiptMaintenance(options),
    lifecycle = createLifecycleService(options);
  return {
    history: createHistoryService(options),
    ...receipts,
    ...lifecycle,
    async close() {
      await lifecycle.closePurge();
      await receipts.close();
    },
    collection: (headers: Headers, residenceId: string) =>
      scope(headers, residenceId, null, async (c, a) => {
        const rows = (
          await c.query<ListRow & { totalActive: number; totalPurchased: number }>(
            'with visible as (select l.* from kitanda.lists l where l."residenceId"=$1 and ' +
              listVisibility +
              ' and l."deletedAt" is null' +
              ') select v.*,coalesce(t.total,0)::int as "totalActive",coalesce(t.bought,0)::int as "totalPurchased" from visible v left join (select i."listId",count(*) as total,count(*) filter(where i.purchased) as bought from kitanda.items i join visible x on x.id=i."listId" where i."deletedAt" is null group by i."listId") t on t."listId"=v.id order by v."createdAt",v.id',
            [residenceId, a.userId, a.residenceAccessId],
          )
        ).rows;
        return rows.map(({ totalActive, totalPurchased, ...r }) => ({
          ...listInfo(r, a),
          residenceName: a.residenceName,
          totalActive,
          totalPurchased,
        }));
      }),
    create: (
      headers: Headers,
      residenceId: string,
      input: { name: string; description?: string },
      key: string,
    ) =>
      scope(headers, residenceId, null, async (c, a) => {
        if (a.role === 'viewer') throw listForbidden();
        const fields = listFields(input);
        const payload = { name: fields.name!, description: fields.description ?? null };
        return confirm(
          c,
          { userId: a.userId, action: 'list.create', parentId: residenceId, key },
          payload,
          async () => {
            const id = randomUUID();
            await c.query(
              'insert into kitanda.lists(id,"residenceId","creatorId",name,description) values($1,$2,$3,$4,$5)',
              [id, residenceId, a.userId, payload.name, payload.description],
            );
            await recordHistory(c, {
              listId: id,
              actorId: a.userId,
              action: 'list.created',
              details: { changes: changes(null, payload) },
            });
            return { resourceId: id };
          },
          options.now ?? Date.now,
        );
      }),
    detail: (h: Headers, id: string) => run(h, id, 'read', async (_c, a, r) => listInfo(r, a)),
    update: (h: Headers, id: string, input: { name?: string; description?: string }) =>
      run(h, id, 'write', async (c, a, r) => {
        const fields = listFields(input);
        const next = {
          name: fields.name ?? r.name,
          description: fields.description === undefined ? r.description : fields.description,
        };
        const differences = changes({ name: r.name, description: r.description }, next);
        if (!Object.keys(differences).length) return listInfo(r, a);
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
        await recordHistory(c, {
          listId: id,
          actorId: a.userId,
          action: 'list.updated',
          details: { changes: differences },
        });
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
      run(h, id, 'manage', async (c, a, r) => {
        const target = (await residenceCandidates(c, r.residenceId, r.creatorId)).find(
          (a) => a.id === accessId,
        );
        if (!target)
          throw new AuthError(
            400,
            'INVALID_SHARE_TARGET',
            'Escolha uma pessoa com acesso ativo a esta residência.',
          );
        const result = await c.query(
          'insert into kitanda.list_shares(id,"listId","residenceId","residenceAccessId") values($1,$2,$3,$4) on conflict("listId","residenceAccessId") where "revokedAt" is null do nothing returning id',
          [randomUUID(), r.id, r.residenceId, accessId],
        );
        if (result.rowCount)
          await recordHistory(c, {
            listId: id,
            actorId: a.userId,
            action: 'share.granted',
            details: { participant: target },
          });
      }),
    revoke: (h: Headers, id: string, accessId: string) =>
      run(h, id, 'manage', async (c, a, r) => {
        const target = (await residenceCandidates(c, r.residenceId, r.creatorId)).find(
          (a) => a.id === accessId,
        );
        const result = await c.query(
          'update kitanda.list_shares set "revokedAt"=now() where "listId"=$1 and "residenceId"=$2 and "residenceAccessId"=$3 and "revokedAt" is null',
          [r.id, r.residenceId, accessId],
        );
        if (result.rowCount)
          await recordHistory(c, {
            listId: id,
            actorId: a.userId,
            action: 'share.revoked',
            details: {
              participant: target ?? { id: accessId, name: 'Participante sem acesso atual' },
            },
          });
      }),
  };
}
export type KitandaService = ReturnType<typeof createKitandaService>;
