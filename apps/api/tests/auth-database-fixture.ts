import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createDatabase } from '../src/database/client.js';
import { createIdentity } from '../src/modules/platform/auth/adapter.js';
import { createTransactions } from '../src/modules/platform/auth/transaction.js';

export const baseURL = 'http://127.0.0.1:5304';
export const secret = randomUUID() + randomUUID();
export const password = 'test-password';
export const origin = { origin: baseURL };
export const username = () => 'u' + randomUUID().replaceAll('-', '').slice(0, 20);
export function testDatabaseUrl() {
  const value = process.env['AUTH_TEST_DATABASE_URL'];
  try {
    if (!value || !new URL(value).pathname.endsWith('_auth_test')) throw new Error();
    for (const other of [
      process.env['DATABASE_URL'],
      process.env['TEST_DATABASE_URL'],
      process.env['POC_DATABASE_URL'],
    ]) {
      if (
        other &&
        decodeURIComponent(new URL(other).pathname) === decodeURIComponent(new URL(value).pathname)
      )
        throw new Error();
    }
    return value;
  } catch {
    throw new Error(
      'AUTH_TEST_DATABASE_URL deve apontar para banco exclusivo terminado em _auth_test.',
    );
  }
}
export async function databaseFixture() {
  const database = createDatabase(testDatabaseUrl());
  await migrate(database.db, {
    migrationsFolder: fileURLToPath(new URL('../drizzle', import.meta.url)),
  });
  const options = { pool: database.pool, secret, baseURL };
  const transactions = createTransactions(database.pool);
  return {
    database,
    options,
    identity: (name = username()) =>
      transactions.run('account:' + name.toLowerCase(), (client) =>
        createIdentity(client, options, { username: name, password }),
      ),
    reset: async () => {
      await database.pool.query(
        'truncate platform."user", platform.auth_setup, platform.auth_limits cascade',
      );
    },
    close: () => database.close(),
  };
}
