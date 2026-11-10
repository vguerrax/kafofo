import { readAuthConfig, readTrustedProxies } from './modules/platform/auth/config.js';

const levels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;
export type LogLevel = (typeof levels)[number];

export function readConfig(env: NodeJS.ProcessEnv) {
  const port = Number(env['PORT'] ?? '4304');
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT deve ser um inteiro entre 1 e 65535.');
  }
  const level = env['LOG_LEVEL'] ?? 'info';
  if (!levels.includes(level as LogLevel)) {
    throw new Error('LOG_LEVEL inválido.');
  }
  const databaseUrl = env['DATABASE_URL'];
  if (databaseUrl) validateDatabaseUrl(databaseUrl);
  const auth = readAuthConfig(env);
  if (auth && !databaseUrl)
    throw new Error('DATABASE_URL é obrigatória quando a autenticação está configurada.');
  return {
    host: env['HOST'] ?? '127.0.0.1',
    port,
    logLevel: level as LogLevel,
    databaseUrl,
    auth,
    trustedProxies: readTrustedProxies(env['TRUSTED_PROXIES']),
  };
}

export function validateDatabaseUrl(value: string): void {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('URL do PostgreSQL inválida.');
  }
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error('A conexão deve usar PostgreSQL.');
  }
}
