import { createDatabase } from '../src/database/client.js';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { fileURLToPath } from 'node:url';
export async function contextDatabase() {
  const value = process.env['CONTEXT_TEST_DATABASE_URL'];
  try {
    if (!value || !new URL(value).pathname.endsWith('_context_test')) throw new Error();
    for (const other of [
      'DATABASE_URL',
      'TEST_DATABASE_URL',
      'POC_DATABASE_URL',
      'AUTH_TEST_DATABASE_URL',
    ])
      if (
        process.env[other] &&
        decodeURIComponent(new URL(process.env[other]!).pathname) ===
          decodeURIComponent(new URL(value).pathname)
      )
        throw new Error();
  } catch {
    throw new Error(
      'CONTEXT_TEST_DATABASE_URL deve ser banco descartável exclusivo terminado em _context_test.',
    );
  }
  const db = createDatabase(value);
  await migrate(db.db, { migrationsFolder: fileURLToPath(new URL('../drizzle', import.meta.url)) });
  return db;
}
