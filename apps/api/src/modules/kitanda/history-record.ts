import { randomUUID } from 'node:crypto';
import type pg from 'pg';
import { Value } from 'typebox/value';
import {
  HistoryActionSchema,
  HistoryDetailsSchema,
  HistoryTargetDetailsSchema,
  type HistoryAction,
  type HistoryDetails,
  type HistoryTargetDetails,
} from '@kafofo/contracts';
export function changes<T extends object>(before: T | null, after: T) {
  const result: { [K in keyof T]?: { before: T[K] | null; after: T[K] } } = {};
  for (const key of Object.keys(after) as (keyof T)[]) {
    if (before ? before[key] !== after[key] : after[key] !== null)
      result[key] = { before: before?.[key] ?? null, after: after[key] };
  }
  return result;
}
export async function recordHistory(
  c: pg.PoolClient,
  event: {
    listId: string;
    actorId: string;
    action: HistoryAction;
    details?: HistoryDetails;
    targets?: { itemId: string; details: HistoryTargetDetails }[];
  },
) {
  const details = event.details ?? {},
    targets = event.targets ?? [];
  if (
    !Value.Check(HistoryActionSchema, event.action) ||
    !Value.Check(HistoryDetailsSchema, details) ||
    targets.some((t) => !Value.Check(HistoryTargetDetailsSchema, t.details))
  )
    throw new Error('Detalhes de histórico inválidos.');
  const id = randomUUID();
  await c.query(
    'insert into kitanda.history_events(id,"listId",action,"actorId",details) values($1,$2,$3,$4,$5)',
    [id, event.listId, event.action, event.actorId, JSON.stringify(details)],
  );
  if (targets.length)
    await c.query(
      'insert into kitanda.history_targets("eventId","itemId",details) select $1,t."itemId",t.details from jsonb_to_recordset($2::jsonb) as t("itemId" uuid,details jsonb)',
      [id, JSON.stringify(targets)],
    );
  return id;
}
export const historyRetention = {
  async redactItem(c: pg.PoolClient, listId: string, itemId: string) {
    await c.query(
      'update kitanda.history_targets t set details=null,"redactedAt"=clock_timestamp() from kitanda.history_events e where e.id=t."eventId" and e."listId"=$1 and t."itemId"=$2 and t."redactedAt" is null',
      [listId, itemId],
    );
  },
  async removeList(c: pg.PoolClient, listId: string) {
    await c.query('delete from kitanda.history_events where "listId"=$1', [listId]);
  },
};
