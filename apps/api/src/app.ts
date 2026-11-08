import { kitandaRoutes } from './modules/kitanda/routes.js';
import type { KitandaService } from './modules/kitanda/service.js';
import { recoveryRoutes } from './modules/platform/recovery/routes.js';
import type { RecoveryService } from './modules/platform/recovery/service.js';
import { invitationRoutes } from './modules/platform/invitations/routes.js';
import type { InvitationService } from './modules/platform/invitations/service.js';
import { randomUUID } from 'node:crypto';
import Fastify, { type FastifyBaseLogger } from 'fastify';
import swagger from '@fastify/swagger';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import type { Database } from './database/client.js';
import { createLogger } from './logger.js';
import { contextRoutes } from './modules/platform/contexts/routes.js';
import type { ContextService } from './modules/platform/contexts/service.js';
import { healthRoutes } from './modules/platform/health.js';
import { authRoutes } from './modules/platform/auth/routes.js';
import type { AuthService } from './modules/platform/auth/service.js';
import { AuthError } from './modules/platform/auth/policies.js';

interface AppOptions {
  kitanda?: KitandaService;
  recovery?: RecoveryService;
  invitations?: InvitationService;
  logger?: FastifyBaseLogger;
  database?: Pick<Database, 'ping' | 'close'>;
  auth?: AuthService;
  contexts?: ContextService;
  authOrigin?: string;
  trustedProxies?: string[];
}

export async function buildApp(options: AppOptions = {}) {
  const app = Fastify({
    loggerInstance: options.logger ?? createLogger('silent'),
    requestIdHeader: false,
    genReqId: () => randomUUID(),
    bodyLimit: 64 * 1024,
    trustProxy: options.trustedProxies?.length ? options.trustedProxies : false,
    ajv: { customOptions: { removeAdditional: false, coerceTypes: false } },
  }).withTypeProvider<TypeBoxTypeProvider>();

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AuthError) {
      if (error.retryAfter) reply.header('Retry-After', String(error.retryAfter));
      return reply
        .code(error.status)
        .send({ error: { code: error.code, message: error.message, requestId: request.id } });
    }
    const validation = error instanceof Error && 'validation' in error;
    const status = validation
      ? 400
      : error instanceof Error && 'statusCode' in error && typeof error.statusCode === 'number'
        ? error.statusCode
        : 500;
    const messages: Record<number, [string, string]> = {
      400: ['INVALID_REQUEST', 'Requisição inválida.'],
      413: ['PAYLOAD_TOO_LARGE', 'O conteúdo excede o limite permitido.'],
      415: ['UNSUPPORTED_MEDIA_TYPE', 'Formato de conteúdo não suportado.'],
    };
    const [code, message] = messages[status] ?? [
      'INTERNAL_ERROR',
      'Não foi possível concluir a operação.',
    ];
    if (status >= 500) request.log.error({ err: error }, 'Falha ao processar requisição');
    return reply.code(status).send({ error: { code, message, requestId: request.id } });
  });
  app.setNotFoundHandler((request, reply) =>
    reply.code(404).send({
      error: {
        code: 'NOT_FOUND',
        message: 'Recurso não encontrado.',
        requestId: request.id,
      },
    }),
  );

  await app.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: { title: 'Kafofo API', version: '0.0.0' },
      servers: [{ url: '/' }],
      tags: [
        { name: 'platform', description: 'Serviços básicos da plataforma' },
        { name: 'kitanda', description: 'Listas de compras da residência' },
      ],
      components: {
        securitySchemes: {
          sessionCookie: { type: 'apiKey', in: 'cookie', name: 'better-auth.session_token' },
          secureSessionCookie: {
            type: 'apiKey',
            in: 'cookie',
            name: '__Secure-better-auth.session_token',
          },
        },
      },
    },
  });
  await app.register(healthRoutes(options.database?.ping ?? (async () => false)), {
    prefix: '/api',
  });
  app.get('/api/openapi.json', { schema: { hide: true } }, async () => app.swagger());
  await app.register(authRoutes(options.auth, options.authOrigin), { prefix: '/api/auth' });
  await app.register(contextRoutes(options.contexts, options.authOrigin), {
    prefix: '/api/platform',
  });
  await app.register(invitationRoutes(options.invitations, options.authOrigin), {
    prefix: '/api/platform',
  });
  await app.register(recoveryRoutes(options.recovery, options.authOrigin), {
    prefix: '/api/auth/recovery',
  });
  await app.register(kitandaRoutes(options.kitanda, options.authOrigin), {
    prefix: '/api/kitanda',
  });
  app.addHook('onClose', async () => {
    await options.auth?.close();
    await options.database?.close();
  });
  return app;
}
