import { readConfig } from '../../../config.js';
import { createDatabase } from '../../../database/client.js';
import { createBootstrap } from './bootstrap.js';
import { createTransactions } from './transaction.js';

let database: ReturnType<typeof createDatabase> | undefined;
try {
  const config = readConfig(process.env);
  if (process.argv.length !== 2 || !config.databaseUrl || !config.auth) throw new Error();
  database = createDatabase(config.databaseUrl);
  const auth = createBootstrap(config.auth, createTransactions(database.pool));
  // Canal explícito do operador. Não encaminhar stdout para logs técnicos.
  process.stdout.write((await auth.issueBootstrap()) + '\n');
} catch {
  process.stderr.write(
    'Não foi possível emitir o código. Confira configuração, migrações e estado da instalação.\n',
  );
  process.exitCode = 1;
} finally {
  await database?.close();
}
