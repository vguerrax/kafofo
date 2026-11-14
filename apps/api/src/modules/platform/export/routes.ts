import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from 'typebox';
import {
  IndividualExportRequestSchema,
  IndividualExportSchema,
  ErrorResponseSchema,
} from '@kafofo/contracts';
import type { IndividualExportService } from './service.js';
import { AuthError, unavailable } from '../auth/policies.js';

export function individualExportRoutes(
  service: IndividualExportService | undefined,
  origin: string | undefined,
): FastifyPluginAsyncTypebox {
  return async (app) => {
    app.addHook('onRequest', async (request, reply) => {
      reply.header('Cache-Control', 'no-store');
      reply.header('Referrer-Policy', 'no-referrer');
      if (!service || !origin) throw unavailable();
      if (request.headers.origin !== origin || request.headers['sec-fetch-site'] === 'cross-site')
        throw new AuthError(403, 'UNTRUSTED_ORIGIN', 'Origem da requisição não permitida.');
    });
    app.post(
      '/export',
      {
        schema: {
          operationId: 'exportOwnAccount',
          summary: 'Baixar dados individuais após confirmar senha',
          tags: ['platform'],
          security: [{ sessionCookie: [] }, { secureSessionCookie: [] }],
          querystring: Type.Object({}, { additionalProperties: false }),
          body: IndividualExportRequestSchema,
          response: {
            200: {
              ...IndividualExportSchema,
              headers: {
                'Content-Disposition': Type.String({
                  description: 'Anexo JSON individual, sem link público.',
                }),
                'Cache-Control': Type.Literal('no-store'),
              },
            },
            ...Object.fromEntries(
              [400, 401, 403, 429, 500, 503].map((n) => [n, ErrorResponseSchema]),
            ),
          },
        },
      },
      async (request, reply) => {
        const data = await service!.download(
          new Headers(request.headers.cookie ? { cookie: request.headers.cookie } : {}),
          request.body.password,
          request.ip,
        );
        reply.header(
          'Content-Disposition',
          `attachment; filename="kafofo-dados-${data.generatedAt.slice(0, 10)}.json"`,
        );
        return data;
      },
    );
  };
}
