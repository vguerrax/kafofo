import type pg from 'pg';
import { createResidenceMaintenance, type PlatformAccessOptions } from '../platform/public.js';

// A #15 deve fornecer redação/remoção do histórico nesta mesma conexão/transação
// antes da publicação. Os comprovantes operacionais não substituem os eventos.
export interface RetentionHistory {
  redactItem: (c: pg.PoolClient, listId: string, itemId: string) => Promise<void>;
  removeList: (c: pg.PoolClient, listId: string) => Promise<void>;
}
export function retentionMaintenance(
  options: Pick<PlatformAccessOptions, 'pool'>,
  history?: RetentionHistory,
) {
  const run = createResidenceMaintenance(options.pool);
  async function purge() {
    const result = { items: 0, lists: 0, failed: 0 };
    // No máximo 50 unidades de cada categoria; a origem do trabalho é persistida.
    const candidates = (
      await options.pool.query<{
        id: string;
        listId: string;
        residenceId: string;
        kind: 'item' | 'list';
      }>(
        '(select i.id,i."listId",l."residenceId",\'item\' as kind from kitanda.items i join kitanda.lists l on l.id=i."listId" where i."deletedAt"<=clock_timestamp()-interval \'720 hours\' order by i."deletedAt",i.id limit 50) union all (select l.id,l.id as "listId",l."residenceId",\'list\' as kind from kitanda.lists l where l."deletedAt"<=clock_timestamp()-interval \'720 hours\' order by l."deletedAt",l.id limit 50)',
      )
    ).rows;
    for (const candidate of candidates) {
      try {
        const removed = await run(candidate.residenceId, candidate.listId, async (c) => {
          if (candidate.kind === 'item') {
            const due = (
              await c.query(
                'select id from kitanda.items where id=$1 and "listId"=$2 and "deletedAt"<=clock_timestamp()-interval \'720 hours\' for update',
                [candidate.id, candidate.listId],
              )
            ).rowCount;
            if (!due) return false;
            await history?.redactItem(c, candidate.listId, candidate.id);
            await c.query('delete from kitanda.items where id=$1', [candidate.id]);
          } else {
            const due = (
              await c.query(
                'select id from kitanda.lists where id=$1 and "deletedAt"<=clock_timestamp()-interval \'720 hours\' for update',
                [candidate.id],
              )
            ).rowCount;
            if (!due) return false;
            await history?.removeList(c, candidate.id);
            await c.query('delete from kitanda.items where "listId"=$1', [candidate.id]);
            await c.query('delete from kitanda.list_shares where "listId"=$1', [candidate.id]);
            await c.query(
              'delete from kitanda.mutation_receipts where "parentId"=$1 or "resourceId"=$1',
              [candidate.id],
            );
            await c.query('delete from kitanda.lists where id=$1', [candidate.id]);
          }
          return true;
        });
        if (removed) result[candidate.kind === 'item' ? 'items' : 'lists']++;
      } catch {
        result.failed++;
      }
    }
    return result;
  }
  let timer: ReturnType<typeof setInterval> | undefined, running: Promise<void> | undefined;
  return {
    purge,
    startPurge(onError: () => void) {
      if (timer) return;
      const tick = () => {
        if (!running)
          running = purge()
            .then((r) => {
              if (r.failed) onError();
            })
            .catch(onError)
            .finally(() => {
              running = undefined;
            });
      };
      tick();
      timer = setInterval(tick, 3600000);
      timer.unref();
    },
    async closePurge() {
      if (timer) clearInterval(timer);
      await running;
    },
  };
}
