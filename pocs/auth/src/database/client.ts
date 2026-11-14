import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate as drizzleMigrate } from 'drizzle-orm/node-postgres/migrator';
import { validateDatabaseUrl } from '../policies.js';
export function openDatabase(url: string | undefined) {
  return new pg.Pool({
    connectionString: validateDatabaseUrl(url),
    max: 5,
    connectionTimeoutMillis: 3000,
  });
}
export async function migrate(pool: pg.Pool) {
  await drizzleMigrate(drizzle(pool), {
    migrationsFolder: fileURLToPath(new URL('../../drizzle', import.meta.url)),
    migrationsSchema: 'auth_poc_migrations',
  });
}
export async function transaction<T>(
  pool: pg.Pool,
  key: string,
  fn: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query('select pg_advisory_xact_lock(hashtext($1))', [key]);
    const result = await fn(client);
    await client.query('commit');
    return result;
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}
