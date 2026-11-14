import { randomUUID } from 'node:crypto';
import type pg from 'pg';
import { AuthError, type PlatformAccessOptions } from '../platform/public.js';
import { createListAccess, listInfo } from './access.js';
import { canonicalQuantity, itemFields, type ItemInput } from './item-policies.js';
import { confirm } from './receipts.js';
import { changes, recordHistory } from './history-record.js';
interface ItemRow {
  id: string;
  listId: string;
  name: string;
  quantity: string | null;
  unit: string | null;
  notes: string | null;
  purchased: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
const columns = 'id,"listId",name,quantity,unit,notes,purchased,version,"createdAt","updatedAt"';
function info(row: ItemRow) {
  return {
    ...row,
    quantity: row.quantity === null ? null : canonicalQuantity(row.quantity),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
async function active(c: pg.PoolClient, listId: string, itemId: string, expectedVersion: number) {
  const row = (
    await c.query<ItemRow>(
      'select ' +
        columns +
        ' from kitanda.items where "listId"=$1 and id=$2 and "deletedAt" is null',
      [listId, itemId],
    )
  ).rows[0];
  if (!row) throw new AuthError(404, 'NOT_FOUND', 'Item indisponível.');
  if (row.version !== expectedVersion)
    throw new AuthError(
      409,
      'ITEM_VERSION_CONFLICT',
      'O item mudou. Compare a versão atual antes de salvar novamente.',
    );
  return row;
}
export function createItemService(options: PlatformAccessOptions) {
  const { run } = createListAccess(options),
    now = options.now ?? Date.now;
  const snapshot = (h: Headers, listId: string) =>
    run(h, listId, 'read', async (c, a, r) => ({
      list: listInfo(r, a),
      items: (
        await c.query<ItemRow>(
          'select ' +
            columns +
            ' from kitanda.items where "listId"=$1 and "deletedAt" is null order by "createdAt",id',
          [listId],
        )
      ).rows.map(info),
    }));
  return {
    snapshot,
    collection: (h: Headers, id: string) => snapshot(h, id).then((s) => s.items),
    create: (h: Headers, listId: string, input: ItemInput & { name: string }, key: string) =>
      run(h, listId, 'write', async (c, a) => {
        const f = itemFields(input),
          payload = {
            name: f.name!,
            quantity: f.quantity ?? null,
            unit: f.unit ?? null,
            notes: f.notes ?? null,
          };
        return confirm(
          c,
          { userId: a.userId, action: 'item.create', parentId: listId, key },
          payload,
          async () => {
            const id = randomUUID();
            await c.query(
              'insert into kitanda.items(id,"listId",name,quantity,unit,notes) values($1,$2,$3,$4,$5,$6)',
              [id, listId, payload.name, payload.quantity, payload.unit, payload.notes],
            );
            await recordHistory(c, {
              listId,
              actorId: a.userId,
              action: 'item.created',
              targets: [
                { itemId: id, details: { name: payload.name, changes: changes(null, payload) } },
              ],
            });
            return { resourceId: id, version: 1 };
          },
          now,
        );
      }),
    update: (
      h: Headers,
      listId: string,
      itemId: string,
      input: ItemInput & { expectedVersion: number },
      key: string,
    ) =>
      run(h, listId, 'write', async (c, a) => {
        const f = itemFields(input);
        return confirm(
          c,
          { userId: a.userId, action: 'item.update', parentId: listId, key },
          { itemId, expectedVersion: input.expectedVersion, fields: f },
          async () => {
            const r = await active(c, listId, itemId, input.expectedVersion),
              next = {
                name: f.name ?? r.name,
                quantity:
                  f.quantity === undefined
                    ? r.quantity === null
                      ? null
                      : canonicalQuantity(r.quantity)
                    : f.quantity,
                unit: f.unit === undefined ? r.unit : f.unit,
                notes: f.notes === undefined ? r.notes : f.notes,
              };
            if (
              next.name === r.name &&
              next.quantity === (r.quantity === null ? null : canonicalQuantity(r.quantity)) &&
              next.unit === r.unit &&
              next.notes === r.notes
            )
              return { resourceId: itemId, version: r.version };
            await c.query(
              'update kitanda.items set name=$3,quantity=$4,unit=$5,notes=$6,version=version+1,"updatedAt"=now() where "listId"=$1 and id=$2',
              [listId, itemId, next.name, next.quantity, next.unit, next.notes],
            );
            await recordHistory(c, {
              listId,
              actorId: a.userId,
              action: 'item.updated',
              targets: [
                {
                  itemId,
                  details: {
                    name: next.name,
                    changes: changes(
                      {
                        name: r.name,
                        quantity: r.quantity === null ? null : canonicalQuantity(r.quantity),
                        unit: r.unit,
                        notes: r.notes,
                      },
                      next,
                    ),
                  },
                },
              ],
            });
            return { resourceId: itemId, version: r.version + 1 };
          },
          now,
        );
      }),
    purchased: (
      h: Headers,
      listId: string,
      itemId: string,
      purchased: boolean,
      expectedVersion: number,
      key: string,
    ) =>
      run(h, listId, 'write', async (c, a) =>
        confirm(
          c,
          { userId: a.userId, action: 'item.purchased', parentId: listId, key },
          { itemId, purchased, expectedVersion },
          async () => {
            const r = await active(c, listId, itemId, expectedVersion);
            if (r.purchased === purchased) return { resourceId: itemId, version: r.version };
            await c.query(
              'update kitanda.items set purchased=$3,version=version+1,"updatedAt"=now() where "listId"=$1 and id=$2',
              [listId, itemId, purchased],
            );
            await recordHistory(c, {
              listId,
              actorId: a.userId,
              action: purchased ? 'item.purchased' : 'item.unpurchased',
              targets: [
                {
                  itemId,
                  details: {
                    name: r.name,
                    changes: { purchased: { before: r.purchased, after: purchased } },
                  },
                },
              ],
            });
            return { resourceId: itemId, version: r.version + 1 };
          },
          now,
        ),
      ),
    remove: (h: Headers, listId: string, itemId: string, expectedVersion: number, key: string) =>
      run(h, listId, 'write', async (c, a) =>
        confirm(
          c,
          { userId: a.userId, action: 'item.remove', parentId: listId, key },
          { itemId, expectedVersion },
          async () => {
            const r = await active(c, listId, itemId, expectedVersion);
            await c.query(
              'update kitanda.items set "deletedAt"=now(),"updatedAt"=now(),version=version+1 where "listId"=$1 and id=$2',
              [listId, itemId],
            );
            await recordHistory(c, {
              listId,
              actorId: a.userId,
              action: 'item.removed',
              targets: [
                {
                  itemId,
                  details: { name: r.name, changes: { deleted: { before: false, after: true } } },
                },
              ],
            });
            return { resourceId: itemId, version: r.version + 1 };
          },
          now,
        ),
      ),
  };
}
export type ItemService = ReturnType<typeof createItemService>;
