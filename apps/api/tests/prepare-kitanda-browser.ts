import { randomUUID } from 'node:crypto';
import { kitandaDatabase } from './kitanda-database.js';
import { createIdentity } from '../src/modules/platform/auth/adapter.js';
import { createTransactions } from '../src/modules/platform/auth/transaction.js';
const db = await kitandaDatabase();
try {
  await db.pool.query(
    'truncate platform.cores,platform."user",platform.auth_setup,platform.auth_limits cascade',
  );
  await createTransactions(db.pool).run(null, async (c) => {
    const users = [];
    for (const username of ['kitanda-owner', 'kitanda-member'])
      users.push(
        await createIdentity(
          c,
          { secret: process.env['AUTH_SECRET']!, baseURL: process.env['AUTH_BASE_URL']! },
          { username, password: 'kitanda-password' },
        ),
      );
    const core = randomUUID(),
      residence = randomUUID();
    await c.query('insert into platform.cores(id,name) values($1,$2)', [core, 'Núcleo Kitanda']);
    await c.query('insert into platform.residences(id,"coreId",name) values($1,$2,$3)', [
      residence,
      core,
      'Casa Kitanda',
    ]);
    for (const [index, u] of users.entries()) {
      const membership = randomUUID();
      await c.query(
        'insert into platform.core_memberships(id,"coreId","userId",role) values($1,$2,$3,$4)',
        [membership, core, u.id, index === 0 ? 'admin' : 'member'],
      );
      await c.query(
        'insert into platform.residence_accesses(id,"coreId","residenceId","membershipId",role) values($1,$2,$3,$4,$5)',
        [randomUUID(), core, residence, membership, index === 0 ? 'responsible' : 'collaborator'],
      );
    }
    await c.query('insert into platform.auth_setup(id,configured) values(1,true)');
  });
} finally {
  await db.close();
}
