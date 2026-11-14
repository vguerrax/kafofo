import { userInfo } from 'node:os';
import { readConfig } from '../../../config.js';
import { createDatabase } from '../../../database/client.js';
import { createRecoveryService } from './service.js';
let db: ReturnType<typeof createDatabase> | undefined;
try {
  const config = readConfig(process.env);
  if (process.argv.length !== 3 || !config.databaseUrl || !config.auth) throw new Error();
  db = createDatabase(config.databaseUrl);
  const result = await createRecoveryService({ pool: db.pool, ...config.auth }).issue(
    { kind: 'operator', identity: 'local-uid:' + userInfo().uid },
    process.argv[2]!,
  );
  // Único canal de saída autorizado para o segredo; nunca encaminhar a logs.
  process.stdout.write(result.link + '\n');
} catch {
  process.stderr.write(
    'Recuperação recusada. Use auth:recover <username-do-administrador-global>; confira configuração, migrações e limite de emissão.\n',
  );
  process.exitCode = 1;
} finally {
  await db?.close();
}
