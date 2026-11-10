import type pg from 'pg';
import type {
  CoreRole,
  ResidenceRole,
  IndividualExport,
  IndividualKitandaAction,
  IndividualSecurityEvent,
} from '@kafofo/contracts';
import type { AuthService } from '../auth/service.js';
import { createTransactions } from '../auth/transaction.js';
import { AuthError, unauthenticated } from '../auth/policies.js';
import type { ExportResidenceAccess } from '../public.js';

type KitandaReader = (
  c: pg.PoolClient,
  userId: string,
  accesses: ExportResidenceAccess[],
  at: string,
) => Promise<IndividualKitandaAction[]>;
export function createIndividualExportService(options: {
  pool: pg.Pool;
  auth: AuthService;
  readKitandaActions: KitandaReader;
}) {
  const tx = createTransactions(options.pool);
  return {
    async download(headers: Headers, password: string, source: string): Promise<IndividualExport> {
      const identity = await options.auth.confirmExportPassword(headers, password, source);
      return tx
        .readSnapshot<IndividualExport>(async (c) => {
          // Primeira leitura de dados fixa a fotografia MVCC e revalida a sessão.
          // Revogações confirmadas antes deste SELECT já integram o recorte.
          const current = (
            await c.query<{
              username: string;
              name: string;
              createdAt: Date;
              generatedAt: string;
            }>(
              `select u.username,u.name,u."createdAt",
          to_char(statement_timestamp() at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') as "generatedAt"
          from platform.session s join platform."user" u on u.id=s."userId"
          where s.id=$1 and s.token=$2 and s."userId"=$3 and s."expiresAt">statement_timestamp()`,
              [identity.sessionId, identity.token, identity.userId],
            )
          ).rows[0];
          if (!current) throw unauthenticated();
          const generatedAt = current.generatedAt;
          const cores = (
            await c.query<{ id: string; name: string; role: CoreRole }>(
              'select n.id,n.name,m.role from platform.core_memberships m join platform.cores n on n.id=m."coreId" where m."userId"=$1 and m."revokedAt" is null order by n.id',
              [identity.userId],
            )
          ).rows;
          const residences = (
            await c.query<ExportResidenceAccess & { name: string; role: ResidenceRole }>(
              'select r.id as "residenceId",a.id as "accessId",r.name,a.role from platform.core_memberships m join platform.residence_accesses a on a."membershipId"=m.id and a."coreId"=m."coreId" join platform.residences r on r.id=a."residenceId" and r."coreId"=m."coreId" where m."userId"=$1 and m."revokedAt" is null and a."revokedAt" is null order by r.id',
              [identity.userId],
            )
          ).rows;
          const security = (
            await c.query<{
              type: string;
              occurredAt: string;
              channel: 'admin' | 'operator' | null;
            }>(
              `select action as type,to_char("createdAt" at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') as "occurredAt",null::text as channel
          from platform.security_events where "targetId"=$1 and "createdAt">$2::timestamptz-interval '2160 hours'
          union all
          select 'recovery.'||action as type,to_char("createdAt" at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') as "occurredAt",channel
          from platform.recovery_events where target=$1 and "createdAt">$2::timestamptz-interval '2160 hours'
          order by "occurredAt",type,channel nulls first`,
              [identity.userId, generatedAt],
            )
          ).rows;
          const securityEvents: IndividualSecurityEvent[] = security.map((e) => ({
            type: e.type,
            occurredAt: e.occurredAt,
            ...(e.channel ? { channel: e.channel } : {}),
          }));
          const kitandaActions = await options.readKitandaActions(
            c,
            identity.userId,
            residences.map((r) => ({ residenceId: r.residenceId, accessId: r.accessId })),
            generatedAt,
          );
          return {
            schemaVersion: 1,
            generatedAt,
            profile: {
              username: current.username,
              name: current.name,
              createdAt: current.createdAt.toISOString(),
            },
            memberships: [
              ...cores.map((n) => ({
                type: 'core' as const,
                id: n.id,
                name: n.name,
                role: n.role,
              })),
              ...residences.map((r) => ({
                type: 'residence' as const,
                id: r.residenceId,
                name: r.name,
                role: r.role,
              })),
            ],
            securityEvents,
            kitandaActions,
          };
        })
        .catch((error: unknown) => {
          if (error instanceof AuthError && error.status === 503)
            throw new AuthError(
              503,
              'EXPORT_UNAVAILABLE',
              'Não foi possível gerar o arquivo. Tente novamente.',
            );
          throw error;
        });
    },
  };
}
export type IndividualExportService = ReturnType<typeof createIndividualExportService>;
