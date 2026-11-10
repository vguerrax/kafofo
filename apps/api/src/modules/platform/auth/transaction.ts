import type pg from 'pg';
import { AuthError, unavailable } from './policies.js';

// Um runner compartilhado pelo serviço limita ocupação e não mantém fila própria.
export function createTransactions(pool: pg.Pool, maximum = 5) {
  let active = 0;
  async function execute<T>(
    key: string | null,
    operation: (client: pg.PoolClient) => Promise<T>,
    snapshot: boolean,
  ): Promise<T> {
    if (active >= maximum) throw unavailable();
    active++;
    let client: pg.PoolClient | undefined;
    let broken = false;
    try {
      client = await pool.connect();
      await client.query(snapshot ? 'begin isolation level repeatable read read only' : 'begin');
      await client.query("set local lock_timeout = '1s'");
      await client.query("set local statement_timeout = '2s'");
      if (key) await client.query('select pg_advisory_xact_lock(hashtext($1))', [key]);
      const result = await operation(client);
      await client.query('commit');
      return result;
    } catch (error) {
      if (client) {
        try {
          await client.query('rollback');
        } catch {
          broken = true;
        }
      }
      if (error instanceof AuthError) throw error;
      throw unavailable();
    } finally {
      client?.release(broken);
      active--;
    }
  }
  return {
    run<T>(key: string | null, operation: (client: pg.PoolClient) => Promise<T>) {
      return execute(key, operation, false);
    },
    readSnapshot<T>(operation: (client: pg.PoolClient) => Promise<T>) {
      return execute(null, operation, true);
    },
  };
}
