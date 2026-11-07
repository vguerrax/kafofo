import { contextDatabase } from './context-database.js';
import { createIdentity } from '../src/modules/platform/auth/adapter.js';
import { createTransactions } from '../src/modules/platform/auth/transaction.js';
const db = await contextDatabase();
try {
  await db.pool.query(
    'truncate platform.cores,platform."user",platform.auth_setup,platform.auth_limits cascade',
  );
  await createTransactions(db.pool).run(null, (c) =>
    createIdentity(
      c,
      { secret: process.env['AUTH_SECRET']!, baseURL: process.env['AUTH_BASE_URL']! },
      { username: 'contexts-browser', password: 'contexts-password' },
    ),
  );
  await db.pool.query('insert into platform.auth_setup(id,configured) values(1,true)');
  // Conta criada internamente na fixture, sem abrir cadastro HTTP.
} finally {
  await db.close();
}
