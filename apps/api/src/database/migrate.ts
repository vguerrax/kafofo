import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createDatabase } from './client.js';

export const migrationsFolder = fileURLToPath(new URL('../../drizzle', import.meta.url));

const databaseUrl = process.env['DATABASE_URL'];
if (!databaseUrl) throw new Error('Configure DATABASE_URL para executar migrações explicitamente.');

const database = createDatabase(databaseUrl);
try {
  await migrate(database.db, { migrationsFolder });
  console.log('Migrações aplicadas.');
} catch {
  console.error('Falha na migração. Verifique a conexão e as migrações revisadas.');
  process.exitCode = 1;
} finally {
  await database.close();
}
