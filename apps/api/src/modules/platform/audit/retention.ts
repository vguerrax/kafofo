import type pg from 'pg';
import { createTransactions } from '../auth/transaction.js';
export async function purgeSecurityAudit(pool: pg.Pool) {
  return createTransactions(pool).run('platform:security-retention', async (c) => {
    let removed = 0;
    for (const table of ['security_events', 'recovery_events']) {
      const result = await c.query(
        'delete from platform.' +
          table +
          ' where id in(select id from platform.' +
          table +
          ' where "createdAt"<=statement_timestamp()-interval \'2160 hours\' order by "createdAt",id limit 500 for update skip locked)',
      );
      removed += result.rowCount ?? 0;
    }
    return removed;
  });
}
