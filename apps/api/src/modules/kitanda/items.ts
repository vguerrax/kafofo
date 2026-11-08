import { randomUUID } from 'node:crypto';
import type pg from 'pg';
import { AuthError, type PlatformAccessOptions } from '../platform/public.js';
import { createListAccess } from './access.js';
import { canonicalQuantity, itemFields, type ItemInput } from './item-policies.js';
interface ItemRow {
  id: string;
  listId: string;
  name: string;
  quantity: string | null;
  unit: string | null;
  notes: string | null;
  purchased: boolean;
  createdAt: Date;
  updatedAt: Date;
}
function info(row: ItemRow) {
  return {
    ...row,
    quantity: row.quantity === null ? null : canonicalQuantity(row.quantity),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
const columns = 'id,"listId",name,quantity,unit,notes,purchased,"createdAt","updatedAt"';
async function active(c: pg.PoolClient, listId: string, itemId: string) {
  const row = (
    await c.query<ItemRow>(
      'select ' +
        columns +
        ' from kitanda.items where "listId"=$1 and id=$2 and "deletedAt" is null',
      [listId, itemId],
    )
  ).rows[0];
  if (!row) throw new AuthError(404, 'NOT_FOUND', 'Item não encontrado.');
  return row;
}
export function createItemService(options: PlatformAccessOptions) {
  const { run } = createListAccess(options);
  return {
    collection: (h: Headers, listId: string) =>
      run(h, listId, 'read', async (c) =>
        (
          await c.query<ItemRow>(
            'select ' +
              columns +
              ' from kitanda.items where "listId"=$1 and "deletedAt" is null order by "createdAt",id',
            [listId],
          )
        ).rows.map(info),
      ),
    create: (h: Headers, listId: string, input: ItemInput & { name: string }) =>
      run(h, listId, 'write', async (c) => {
        const f = itemFields(input);
        const row = (
          await c.query<ItemRow>(
            'insert into kitanda.items(id,"listId",name,quantity,unit,notes) values($1,$2,$3,$4,$5,$6) returning ' +
              columns,
            [randomUUID(), listId, f.name, f.quantity ?? null, f.unit ?? null, f.notes ?? null],
          )
        ).rows[0]!;
        return info(row);
      }),
    update: (h: Headers, listId: string, itemId: string, input: ItemInput) =>
      run(h, listId, 'write', async (c) => {
        const row = await active(c, listId, itemId),
          f = itemFields(input);
        const result = (
          await c.query<ItemRow>(
            'update kitanda.items set name=$3,quantity=$4,unit=$5,notes=$6,"updatedAt"=now() where "listId"=$1 and id=$2 and "deletedAt" is null returning ' +
              columns,
            [
              listId,
              itemId,
              f.name ?? row.name,
              f.quantity === undefined ? row.quantity : f.quantity,
              f.unit === undefined ? row.unit : f.unit,
              f.notes === undefined ? row.notes : f.notes,
            ],
          )
        ).rows[0]!;
        return info(result);
      }),
    purchased: (h: Headers, listId: string, itemId: string, purchased: boolean) =>
      run(h, listId, 'write', async (c) => {
        const row = await active(c, listId, itemId);
        if (row.purchased === purchased) return info(row);
        return info(
          (
            await c.query<ItemRow>(
              'update kitanda.items set purchased=$3,"updatedAt"=now() where "listId"=$1 and id=$2 and "deletedAt" is null returning ' +
                columns,
              [listId, itemId, purchased],
            )
          ).rows[0]!,
        );
      }),
    remove: (h: Headers, listId: string, itemId: string) =>
      run(h, listId, 'write', async (c) => {
        await active(c, listId, itemId);
        await c.query(
          'update kitanda.items set "deletedAt"=now(),"updatedAt"=now() where "listId"=$1 and id=$2 and "deletedAt" is null',
          [listId, itemId],
        );
      }),
  };
}
export type ItemService = ReturnType<typeof createItemService>;
