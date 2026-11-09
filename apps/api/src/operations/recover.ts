// Local maintenance only. API/proxy remain stopped until operator reconciliation.
import { createDatabase } from '../database/client.js';
import { retentionMaintenance } from '../modules/kitanda/retention.js';
import { purgeSecurityAudit } from '../modules/platform/public.js';

const database = createDatabase(process.env['DATABASE_URL']!);
try {
  await database.pool.query(`begin;
    delete from platform.session;
    delete from platform.verification;
    update platform.auth_setup set digest=null,"expiresAt"=null;
    update platform.invitations set "revokedAt"=clock_timestamp()
      where "revokedAt" is null and "consumedAt" is null;
    update platform.password_recoveries set "revokedAt"=clock_timestamp()
      where "revokedAt" is null and "consumedAt" is null;
    delete from kitanda.mutation_receipts;
    commit;`);
  const maintenance = retentionMaintenance({ pool: database.pool });
  for (;;) {
    const result = await maintenance.purge();
    if (result.failed) throw new Error();
    if (result.items + result.lists === 0) break;
  }
  while (await purgeSecurityAudit(database.pool)) {
    /* drain every bounded batch */
  }
  const pending = await database.pool.query(`select
    (select count(*) from kitanda.items where "deletedAt"<=clock_timestamp()-interval '720 hours') +
    (select count(*) from kitanda.lists where "deletedAt"<=clock_timestamp()-interval '720 hours') as count`);
  if (Number(pending.rows[0]?.count) !== 0) throw new Error();
  process.stdout.write('Sessões/credenciais temporárias invalidadas e expurgos reaplicados.\n');
} catch {
  process.stderr.write('Recuperação incompleta. Mantenha a entrada bloqueada.\n');
  process.exitCode = 1;
} finally {
  await database.close();
}
