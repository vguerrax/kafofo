import { randomUUID } from 'node:crypto';
import type pg from 'pg';
import type { SecurityAction } from './schema.js';
export async function recordSecurity(
  c: pg.PoolClient,
  event: {
    action: SecurityAction;
    actorId: string;
    targetId?: string;
    coreId: string;
    residenceId?: string;
    invitationId?: string;
    membershipId?: string;
    residenceAccessId?: string;
    previousRole?: string;
    nextRole?: string;
  },
) {
  // Lista explícita de colunas: nenhum payload, cabeçalho ou segredo é serializado.
  await c.query(
    'insert into platform.security_events(id,action,"actorId","targetId","coreId","residenceId","invitationId","membershipId","residenceAccessId","previousRole","nextRole") values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
    [
      randomUUID(),
      event.action,
      event.actorId,
      event.targetId ?? null,
      event.coreId,
      event.residenceId ?? null,
      event.invitationId ?? null,
      event.membershipId ?? null,
      event.residenceAccessId ?? null,
      event.previousRole ?? null,
      event.nextRole ?? null,
    ],
  );
}
