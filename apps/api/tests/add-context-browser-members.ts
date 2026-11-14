import { randomUUID } from 'node:crypto';
import { contextDatabase } from './context-database.js';
import { createIdentity } from '../src/modules/platform/auth/adapter.js';
import { createTransactions } from '../src/modules/platform/auth/transaction.js';
const coreId = process.argv[2];
if (!coreId || !/^[0-9a-f-]{36}$/.test(coreId)) throw new Error('Núcleo de fixture obrigatório.');
const db = await contextDatabase();
try {
  for (const username of ['housing-member', 'housing-viewer'])
    await createTransactions(db.pool).run('core:' + coreId, async (c) => {
      const user = await createIdentity(
        c,
        { secret: process.env['AUTH_SECRET']!, baseURL: process.env['AUTH_BASE_URL']! },
        { username, password: 'contexts-password' },
      );
      await c.query(
        'insert into platform.core_memberships(id,"coreId","userId",role) values($1,$2,$3,\'member\')',
        [randomUUID(), coreId, user.id],
      );
    });
} finally {
  await db.close();
}
