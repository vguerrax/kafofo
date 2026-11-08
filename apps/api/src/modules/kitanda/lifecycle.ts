import type { ClearTarget } from '@kafofo/contracts';
import { AuthError, type PlatformAccessOptions } from '../platform/public.js';
import { createListAccess, listNotFound, listVisibility } from './access.js';
import { listCapabilities } from './policies.js';
import { confirm } from './receipts.js';
import { retentionMaintenance } from './retention.js';

const selectionConflict = () =>
  new AuthError(
    409,
    'CLEAR_SELECTION_CHANGED',
    'A seleção mudou. Atualize os comprados e confirme a nova seleção.',
  );
const cycleConflict = () =>
  new AuthError(
    409,
    'LIST_LIFECYCLE_CONFLICT',
    'O ciclo da lista mudou. Atualize e confirme novamente.',
  );
export function createLifecycleService(options: PlatformAccessOptions) {
  const { scope, run } = createListAccess(options),
    now = options.now ?? Date.now;
  return {
    ...retentionMaintenance(options),
    clearPurchased: (h: Headers, listId: string, targets: ClearTarget[], key: string) =>
      run(h, listId, 'write', async (c, a) => {
        // Ordenação torna a impressão independente da ordem visual do conjunto.
        const selection = [...targets].sort((a, b) => a.itemId.localeCompare(b.itemId));
        if (
          !selection.length ||
          selection.length > 500 ||
          new Set(selection.map((t) => t.itemId)).size !== selection.length
        )
          throw selectionConflict();
        return confirm(
          c,
          { userId: a.userId, action: 'items.clear-purchased', parentId: listId, key },
          { targets: selection },
          async () => {
            const rows = (
              await c.query<{
                id: string;
                version: number;
                purchased: boolean;
                deletedAt: Date | null;
              }>(
                'select id,version,purchased,"deletedAt" from kitanda.items where "listId"=$1 and id=any($2::uuid[])',
                [listId, selection.map((t) => t.itemId)],
              )
            ).rows;
            if (
              rows.length !== selection.length ||
              selection.some(
                (t) =>
                  !rows.some(
                    (r) =>
                      r.id === t.itemId &&
                      r.version === t.expectedVersion &&
                      r.purchased &&
                      r.deletedAt === null,
                  ),
              )
            )
              throw selectionConflict();
            await c.query(
              'update kitanda.items set "deletedAt"=statement_timestamp(),"updatedAt"=statement_timestamp(),version=version+1 where "listId"=$1 and id=any($2::uuid[])',
              [listId, selection.map((t) => t.itemId)],
            );
            return { resourceId: listId };
          },
          now,
        );
      }),
    remove: (h: Headers, listId: string, expectedRevision: number, key: string) =>
      run(
        h,
        listId,
        'write',
        async (c, a, row) =>
          confirm(
            c,
            { userId: a.userId, action: 'list.remove', parentId: listId, key },
            { expectedRevision },
            async () => {
              if (row.lifecycleRevision !== expectedRevision || row.deletedAt !== null)
                throw cycleConflict();
              await c.query(
                'update kitanda.lists set "deletedAt"=clock_timestamp(),"deletedBy"=$2,"lifecycleRevision"="lifecycleRevision"+1,"updatedAt"=statement_timestamp() where id=$1',
                [listId, a.userId],
              );
              return { resourceId: listId, version: row.lifecycleRevision + 1 };
            },
            now,
          ),
        true,
      ),
    trash: (h: Headers, residenceId: string) =>
      scope(h, residenceId, null, async (c, a) => {
        const rows = (
          await c.query<{
            id: string;
            name: string;
            creatorId: string;
            lifecycleRevision: number;
            deletedAt: Date;
            recoverableUntil: Date;
          }>(
            'select l.id,l.name,l."creatorId",l."lifecycleRevision",l."deletedAt",l."deletedAt"+interval \'720 hours\' as "recoverableUntil" from kitanda.lists l where l."residenceId"=$1 and ' +
              listVisibility +
              ' and l."deletedAt">clock_timestamp()-interval \'720 hours\' order by l."deletedAt" desc,l.id',
            [residenceId, a.userId, a.residenceAccessId],
          )
        ).rows;
        return rows.map(({ creatorId, deletedAt, recoverableUntil, ...r }) => ({
          ...r,
          deletedAt: deletedAt.toISOString(),
          recoverableUntil: recoverableUntil.toISOString(),
          canWrite: listCapabilities(creatorId === a.userId, a.role).canWrite,
        }));
      }),
    restore: (h: Headers, listId: string, expectedRevision: number, key: string) =>
      run(
        h,
        listId,
        'write',
        async (c, a, row) => {
          // clock_timestamp é lido depois dos locks, inclusive se a transação esperou.
          if (
            row.deletedAt !== null &&
            !(
              await c.query(
                'select 1 from kitanda.lists where id=$1 and "deletedAt">clock_timestamp()-interval \'720 hours\'',
                [listId],
              )
            ).rowCount
          )
            throw listNotFound();
          return confirm(
            c,
            { userId: a.userId, action: 'list.restore', parentId: listId, key },
            { expectedRevision },
            async () => {
              if (row.lifecycleRevision !== expectedRevision || row.deletedAt === null)
                throw cycleConflict();
              await c.query(
                'update kitanda.lists set "deletedAt"=null,"deletedBy"=null,"lifecycleRevision"="lifecycleRevision"+1,"updatedAt"=statement_timestamp() where id=$1',
                [listId],
              );
              return { resourceId: listId, version: row.lifecycleRevision + 1 };
            },
            now,
          );
        },
        true,
      ),
  };
}
