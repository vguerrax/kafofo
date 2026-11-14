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
  lifecycleRevision: number;
  deletedAt: Date | null;
  deletedBy: string | null;
}
export const listNotFound = () => new AuthError(404, 'NOT_FOUND', 'Lista não encontrada.');
export const listForbidden = () =>
  new AuthError(403, 'FORBIDDEN', 'Você não tem permissão para esta ação.');
// Mesmo predicado para coleção e detalhe; o vínculo ativo vem do escopo da plataforma.
export function listVisibilityFor(user: string, access: string) {
  // Expressões SQL constantes do módulo; nenhum valor de requisição é interpolado.
  return `(l."creatorId"=${user} or exists(select 1 from kitanda.list_shares s where s."listId"=l.id and s."residenceAccessId"=${access} and s."revokedAt" is null))`;
}
export const listVisibility = listVisibilityFor('$2', '$3');
export function historyWithinRetention(at: string) {
  return `(l."deletedAt" is null or l."deletedAt">${at}-interval '720 hours')`;
}
export function listInfo(row: ListRow, actor: ResidenceActor) {
  const { description } = row;
  return {
    id: row.id,
    residenceId: row.residenceId,
    creatorId: row.creatorId,
    name: row.name,
    lifecycleRevision: row.lifecycleRevision,
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
    lifecycle = false,
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
        if (!lifecycle && row.deletedAt !== null) throw listNotFound();
        // Prazo calculado no banco após os locks, antes de avaliar escrita.
        if (
          lifecycle &&
          row.deletedAt !== null &&
          !(
            await c.query(
              'select 1 from kitanda.lists l where l.id=$1 and ' +
                historyWithinRetention('clock_timestamp()'),
              [listId],
            )
          ).rowCount
        )
          throw listNotFound();
        const caps = listCapabilities(row.creatorId === actor.userId, actor.role);
        if (
          (capability === 'write' && !caps.canWrite) ||
          (capability === 'manage' && !caps.canManageShares)
        )
          throw listForbidden();
        return operation(c, actor, row);
      },
    ).catch((error: unknown) => {
      if (error instanceof AuthError && error.status === 404) throw listNotFound();
      throw error;
    });
  }
  return { scope, run };
}
