import type pg from 'pg';
import type { IndividualKitandaAction } from '@kafofo/contracts';
import type { ExportResidenceAccess } from '../platform/public.js';
import { historyWithinRetention, listVisibilityFor } from './access.js';

// Leitura no snapshot fornecido pela plataforma; esta função não abre outra transação.
export async function exportOwnActions(
  c: pg.PoolClient,
  userId: string,
  accesses: ExportResidenceAccess[],
  at: string,
): Promise<IndividualKitandaAction[]> {
  const rows = (
    await c.query<IndividualKitandaAction>(
      `select e.action as type,to_char(e."createdAt" at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') as "occurredAt",l.id as "listId"
    from unnest($2::uuid[],$3::uuid[]) a("residenceId","accessId")
    join kitanda.lists l on l."residenceId"=a."residenceId"
    join kitanda.history_events e on e."listId"=l.id and e."actorId"=$1
    where ${listVisibilityFor('$1', 'a."accessId"')} and ${historyWithinRetention('$4::timestamptz')}
    order by e."createdAt",e.id`,
      [userId, accesses.map((a) => a.residenceId), accesses.map((a) => a.accessId), at],
    )
  ).rows;
  return rows.map((e) => ({ type: e.type, occurredAt: e.occurredAt, listId: e.listId }));
}
