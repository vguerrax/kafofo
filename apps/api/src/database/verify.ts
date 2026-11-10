import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createDatabase } from './client.js';

const url = process.env['TEST_DATABASE_URL'];
if (!url) throw new Error('Configure TEST_DATABASE_URL com um banco de teste separado.');
if (url === process.env['DATABASE_URL']) {
  throw new Error('TEST_DATABASE_URL deve ser diferente de DATABASE_URL.');
}

const database = createDatabase(url);
try {
  const migrationsFolder = fileURLToPath(new URL('../../drizzle', import.meta.url));
  await migrate(database.db, { migrationsFolder });
  const before = await database.pool.query<{ count: string }>(
    'select count(*)::text as count from drizzle.__drizzle_migrations',
  );
  await migrate(database.db, { migrationsFolder });
  const after = await database.pool.query<{ count: string }>(
    'select count(*)::text as count from drizzle.__drizzle_migrations',
  );
  assert.equal(after.rows[0]?.count, before.rows[0]?.count);
  const schema = await database.pool.query<{ name: string | null }>(
    "select to_regnamespace('platform')::text as name",
  );
  assert.equal(schema.rows[0]?.name, 'platform');
  assert.equal(await database.ping(), true);
  console.log('PostgreSQL: migração, reexecução sem duplicação e conectividade verificadas.');
} catch {
  console.error(
    'Falha na verificação do banco de teste. Nenhuma limpeza destrutiva foi executada.',
  );
  process.exitCode = 1;
} finally {
  await database.close();
}
