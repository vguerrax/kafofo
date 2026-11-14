import pino, { type DestinationStream } from 'pino';
import type { LogLevel } from './config.js';

export function createLogger(level: LogLevel, destination?: DestinationStream) {
  return pino(
    {
      level,
      redact: {
        paths: [
          'password',
          'token',
          'secret',
          'authorization',
          'cookie',
          'databaseUrl',
          '*.password',
          '*.token',
          '*.secret',
          '*.authorization',
          '*.cookie',
          '*.databaseUrl',
          'req.headers.authorization',
          'req.headers.cookie',
          'res.headers["set-cookie"]',
        ],
        censor: '[REDACTED]',
      },
      serializers: {
        // Não registrar URLs (podem conter tokens), cabeçalhos ou payloads.
        req: (request: { id?: string; method?: string }) => ({
          id: request.id,
          method: request.method,
        }),
        res: (response: { statusCode?: number }) => ({ statusCode: response.statusCode }),
        // Mensagem/stack de erro pode conter SQL, URL de conexão ou dados enviados.
        err: (error: { name?: string; code?: string }) => ({
          type: error.name,
          code: error.code,
        }),
      },
    },
    destination,
  );
}
