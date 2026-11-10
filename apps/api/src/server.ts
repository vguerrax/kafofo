import { createItemService } from './modules/kitanda/items.js';
import { createKitandaService } from './modules/kitanda/service.js';
import { createRecoveryService } from './modules/platform/recovery/service.js';
import { createInvitationService } from './modules/platform/invitations/service.js';
import { createContextService } from './modules/platform/contexts/service.js';
import { buildApp } from './app.js';
import { readConfig } from './config.js';
import { createDatabase } from './database/client.js';
import { createLogger } from './logger.js';
import { createAuthService } from './modules/platform/auth/service.js';
import { createIndividualExportService } from './modules/platform/export/service.js';
import { exportOwnActions } from './modules/kitanda/public.js';

const config = readConfig(process.env);
const logger = createLogger(config.logLevel);
const database = config.databaseUrl
  ? createDatabase(config.databaseUrl, () => logger.error('Falha em conexão ociosa do PostgreSQL.'))
  : undefined;
const auth =
  database && config.auth ? createAuthService({ pool: database.pool, ...config.auth }) : undefined;
const kitanda =
  database && config.auth
    ? createKitandaService({ pool: database.pool, ...config.auth })
    : undefined;
const app = await buildApp({
  logger,
  ...(database ? { database } : {}),
  ...(auth ? { auth, authOrigin: config.auth!.baseURL } : {}),
  trustedProxies: config.trustedProxies,
  ...(database && config.auth
    ? {
        items: createItemService({ pool: database.pool, ...config.auth }),
        ...(kitanda ? { kitanda } : {}),
        recovery: createRecoveryService({ pool: database.pool, ...config.auth }),
        contexts: createContextService({ pool: database.pool, ...config.auth }),
        invitations: createInvitationService({ pool: database.pool, ...config.auth }),
        ...(auth
          ? {
              individualExport: createIndividualExportService({
                pool: database.pool,
                auth,
                readKitandaActions: exportOwnActions,
              }),
            }
          : {}),
      }
    : {}),
});
kitanda?.startCleanup(() => logger.error('Falha na limpeza de comprovantes do Kitanda.'));
kitanda?.startPurge(() =>
  logger.error('Falha no expurgo de dados retidos; nova tentativa no próximo ciclo.'),
);
auth?.startCleanup(() => logger.error('Falha na limpeza de registros expirados de autenticação.'));

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void app.close().catch(() => {
      logger.error('Falha ao encerrar a API.');
      process.exitCode = 1;
    });
  });
}

try {
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  logger.error({ err: error }, 'Falha ao iniciar a API');
  await app.close();
  process.exitCode = 1;
}
