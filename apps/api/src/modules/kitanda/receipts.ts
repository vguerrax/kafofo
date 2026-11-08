import { createHash, randomUUID } from 'node:crypto';
import type pg from 'pg';
import { AuthError, createTransactions, type PlatformAccessOptions } from '../platform/public.js';
export interface Receipt {
  confirmed: true;
  resourceId: string;
  version?: number;
}
function stable(value: unknown): string {
  if (value && typeof value === 'object' && !Array.isArray(value))
    return (
      '{' +
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => JSON.stringify(k) + ':' + stable(v))
        .join(',') +
      '}'
    );
  return JSON.stringify(value);
}
type Scope = { userId: string; action: string; parentId: string; key: string };
export function confirm(
  c: pg.PoolClient,
  scope: Scope,
  payload: unknown,
  operation: () => Promise<{ resourceId: string; version: number }>,
  now?: () => number,
): Promise<Receipt & { version: number }>;
export function confirm(
  c: pg.PoolClient,
  scope: Scope,
  payload: unknown,
  operation: () => Promise<{ resourceId: string; version?: number }>,
  now?: () => number,
): Promise<Receipt>;
export async function confirm(
  c: pg.PoolClient,
  scope: { userId: string; action: string; parentId: string; key: string },
  payload: unknown,
  operation: () => Promise<{ resourceId: string; version?: number }>,
  now: () => number = Date.now,
): Promise<Receipt> {
  const fingerprint = createHash('sha256').update(stable(payload)).digest('hex'),
    args = [scope.userId, scope.action, scope.parentId, scope.key];
  const prior = (
    await c.query<{
      fingerprint: string;
      resourceId: string;
      version: number | null;
      expiresAt: Date;
    }>(
      'select fingerprint,"resourceId",version,"expiresAt" from kitanda.mutation_receipts where "userId"=$1 and action=$2 and "parentId"=$3 and key=$4',
      args,
    )
  ).rows[0];
  if (prior && prior.expiresAt.getTime() > now()) {
    if (prior.fingerprint !== fingerprint)
      throw new AuthError(409, 'IDEMPOTENCY_KEY_REUSED', 'Esta chave já confirmou outra operação.');
    return {
      confirmed: true,
      resourceId: prior.resourceId,
      ...(prior.version === null ? {} : { version: prior.version }),
    };
  }
  if (prior)
    await c.query(
      'delete from kitanda.mutation_receipts where "userId"=$1 and action=$2 and "parentId"=$3 and key=$4',
      args,
    );
  const result = await operation();
  await c.query(
    'insert into kitanda.mutation_receipts(id,"userId",action,"parentId",key,fingerprint,"resourceId",version,"createdAt","expiresAt") values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
    [
      randomUUID(),
      ...args,
      fingerprint,
      result.resourceId,
      result.version ?? null,
      new Date(now()),
      new Date(now() + 86400000),
    ],
  );
  return { confirmed: true, ...result };
}
export function receiptMaintenance(options: PlatformAccessOptions) {
  const tx = createTransactions(options.pool),
    now = options.now ?? Date.now;
  const cleanup = () =>
    tx.run('kitanda:receipt-cleanup', async (c) => {
      await c.query(
        'delete from kitanda.mutation_receipts where id in(select id from kitanda.mutation_receipts where "expiresAt"<=$1 order by "expiresAt",id limit 500 for update skip locked)',
        [new Date(now())],
      );
    });
  let timer: ReturnType<typeof setInterval> | undefined, running: Promise<void> | undefined;
  return {
    cleanup,
    startCleanup(onError: () => void) {
      if (timer) return;
      const run = () => {
        if (!running)
          running = cleanup()
            .catch(onError)
            .finally(() => {
              running = undefined;
            });
      };
      run();
      timer = setInterval(run, 60000);
      timer.unref();
    },
    async close() {
      if (timer) clearInterval(timer);
      await running;
    },
  };
}
