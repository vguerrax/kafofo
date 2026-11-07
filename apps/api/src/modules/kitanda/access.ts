import type pg from 'pg';
import {
  createResidenceScope,
  type PlatformAccessOptions,
  type ResidenceActor,
} from '../platform/public.js';
import { AuthError } from '../platform/public.js';
import { listCapabilities } from './policies.js';
export interface ListRow {
  id: string;
  residenceId: string;
  creatorId: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}
export const listNotFound = () => new AuthError(404, 'NOT_FOUND', 'Lista não encontrada.');
export const listForbidden = () =>
  new AuthError(403, 'FORBIDDEN', 'Você não tem permissão para esta ação.');
// Mesmo predicado para coleção e detalhe; o vínculo ativo vem do escopo da plataforma.
export const listVisibility =
  '(l."creatorId"=$2 or exists(select 1 from kitanda.list_shares s where s."listId"=l.id and s."residenceAccessId"=$3 and s."revokedAt" is null))';
export function listInfo(row: ListRow, actor: ResidenceActor) {
  const { description, ...rest } = row;
  return {
    ...rest,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    ...(description === null ? {} : { description }),
    ...listCapabilities(row.creatorId === actor.userId, actor.role),
  };
}
export function createListAccess(options: PlatformAccessOptions) {
  const scope = createResidenceScope(options);
  async function run<T>(
    headers: Headers,
    listId: string,
    capability: 'read' | 'write' | 'manage',
    operation: (c: pg.PoolClient, actor: ResidenceActor, row: ListRow) => Promise<T>,
  ) {
    return scope(
      headers,
      async (c) => {
        const row = (
          await c.query<{ residenceId: string }>(
            'select "residenceId" from kitanda.lists where id=$1',
            [listId],
          )
        ).rows[0];
        if (!row) throw listNotFound();
        return row.residenceId;
      },
      listId,
      async (c, actor) => {
        const row = (
          await c.query<ListRow>(
            'select l.* from kitanda.lists l where l.id=$4 and l."residenceId"=$1 and ' +
              listVisibility,
            [actor.residenceId, actor.userId, actor.residenceAccessId, listId],
          )
        ).rows[0];
        if (!row) throw listNotFound();
        const caps = listCapabilities(row.creatorId === actor.userId, actor.role);
        if (
          (capability === 'write' && !caps.canWrite) ||
          (capability === 'manage' && !caps.canManageShares)
        )
          throw listForbidden();
        return operation(c, actor, row);
      },
    );
  }
  return { scope, run };
}
