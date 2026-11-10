import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { HealthResponseSchema, ReadyResponseSchema, ErrorResponseSchema } from '@kafofo/contracts';

export function healthRoutes(ping: () => Promise<boolean>): FastifyPluginAsyncTypebox {
  return async (app) => {
    app.get(
      '/health',
      {
        schema: {
          operationId: 'getHealth',
          summary: 'Verificar se o processo está respondendo',
          tags: ['platform'],
          security: [],
          response: { 200: HealthResponseSchema },
        },
      },
      async () => ({ status: 'ok' as const, service: 'kafofo' as const }),
    );

    app.get(
      '/ready',
      {
        schema: {
          operationId: 'getReadiness',
          summary: 'Verificar conectividade com PostgreSQL',
          tags: ['platform'],
          security: [],
          response: { 200: ReadyResponseSchema, 503: ErrorResponseSchema },
        },
      },
      async (request, reply) => {
        if (!(await ping())) {
          return reply.code(503).send({
            error: {
              code: 'SERVICE_UNAVAILABLE',
              message: 'Serviço temporariamente indisponível.',
              requestId: request.id,
            },
          });
        }
        return reply.code(200).send({ status: 'ready' });
      },
    );
  };
}
