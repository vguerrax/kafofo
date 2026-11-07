import type { FastifyPluginAsync } from 'fastify';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import * as c from '@kafofo/contracts';
import { AuthError, unavailable } from '../auth/policies.js';
import type { RecoveryService } from './service.js';
export function recoveryRoutes(
  service: RecoveryService | undefined,
  origin: string | undefined,
): FastifyPluginAsync {
  return async (instance) => {
    const app = instance.withTypeProvider<TypeBoxTypeProvider>();
    app.addHook('onRequest', async (req, reply) => {
      reply.header('Cache-Control', 'no-store').header('Referrer-Policy', 'no-referrer');
      if (!service || !origin) throw unavailable();
      if (req.headers.origin !== origin || req.headers['sec-fetch-site'] === 'cross-site')
        throw new AuthError(403, 'UNTRUSTED_ORIGIN', 'Origem da requisição não permitida.');
    });
    const errors = Object.fromEntries(
      [400, 401, 403, 404, 429, 503].map((n) => [n, c.ErrorResponseSchema]),
    );
    app.post(
      '/issue',
      {
        schema: {
          operationId: 'issueRecovery',
          summary: 'Emitir recuperação para outra conta',
          tags: ['platform'],
          security: [{ sessionCookie: [] }, { secureSessionCookie: [] }],
          body: c.RecoveryIssueSchema,
          response: { 201: c.RecoveryLinkSchema, ...errors },
        },
      },
      async (req, reply) => {
        await service!.rate(req.ip, 'issue');
        return reply.code(201).send(
          await service!.issue(
            {
              kind: 'admin',
              headers: new Headers(req.headers.cookie ? { cookie: req.headers.cookie } : {}),
            },
            req.body.username,
          ),
        );
      },
    );
    app.post(
      '/preview',
      {
        schema: {
          operationId: 'previewRecovery',
          summary: 'Verificar validade da recuperação',
          tags: ['platform'],
          security: [],
          body: c.RecoveryTokenSchema,
          response: { 200: c.RecoveryPreviewSchema, ...errors },
        },
      },
      async (req) => {
        await service!.rate(req.ip, 'preview');
        return service!.preview(req.body.token);
      },
    );
    app.post(
      '/complete',
      {
        schema: {
          operationId: 'completeRecovery',
          summary: 'Definir senha e revogar sessões',
          tags: ['platform'],
          security: [],
          body: c.RecoveryCompleteSchema,
          response: { 204: { type: 'null' }, ...errors },
        },
      },
      async (req, reply) => {
        await service!.rate(req.ip, 'complete');
        await service!.complete(req.body.token, req.body.newPassword);
        return reply.code(204).send(null);
      },
    );
  };
}
