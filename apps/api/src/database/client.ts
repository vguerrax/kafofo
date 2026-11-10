import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { validateDatabaseUrl } from '../config.js';

export function createDatabase(databaseUrl: string, onPoolError: () => void = () => undefined) {
  validateDatabaseUrl(databaseUrl);
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    max: 5,
    connectionTimeoutMillis: 2000,
    idleTimeoutMillis: 10000,
    statement_timeout: 2000,
  });
  // Conexão ociosa pode falhar fora de uma requisição; observar sem expor credenciais.
  pool.on('error', onPoolError);
  const db = drizzle(pool);
  return {
    db,
    pool,
    async ping(): Promise<boolean> {
      try {
        await pool.query('select 1');
        return true;
      } catch {
        return false;
      }
    },
    async close(): Promise<void> {
      await pool.end();
    },
  };
}

export type Database = ReturnType<typeof createDatabase>;
