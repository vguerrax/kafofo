import { recoveryDatabase } from './recovery-database.js';
import { createIdentity } from '../src/modules/platform/auth/adapter.js';
import { createTransactions } from '../src/modules/platform/auth/transaction.js';
const db = await recoveryDatabase();
try {
  await db.pool.query(
    'truncate platform.cores,platform."user",platform.auth_setup,platform.auth_limits cascade',
  );
  for (const username of ['recovery-admin', 'recovery-member'])
    await createTransactions(db.pool).run(null, (c) =>
      createIdentity(
        c,
        { secret: process.env['AUTH_SECRET']!, baseURL: process.env['AUTH_BASE_URL']! },
        { username, password: 'recovery-password' },
      ),
    );
  await db.pool.query('update platform."user" set "globalAdmin"=true where username=$1', [
    'recovery-admin',
  ]);
  await db.pool.query('insert into platform.auth_setup(id,configured) values(1,true)');
} finally {
  await db.close();
}
