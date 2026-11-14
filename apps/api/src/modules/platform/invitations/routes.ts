import type { FastifyPluginAsync } from 'fastify';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from 'typebox';
import * as c from '@kafofo/contracts';
import type { InvitationService } from './service.js';
import { AuthError, unavailable } from '../auth/policies.js';
export function invitationRoutes(
  service: InvitationService | undefined,
  origin: string | undefined,
): FastifyPluginAsync {
  return async (instance) => {
    const app = instance.withTypeProvider<TypeBoxTypeProvider>();
    app.addHook('onRequest', async (req, reply) => {
      reply.header('Cache-Control', 'no-store').header('Referrer-Policy', 'no-referrer');
      if (!service || !origin) throw unavailable();
      if (
        req.method !== 'GET' &&
        (req.headers.origin !== origin || req.headers['sec-fetch-site'] === 'cross-site')
      )
        throw new AuthError(403, 'UNTRUSTED_ORIGIN', 'Origem da requisição não permitida.');
    });
    const errors = Object.fromEntries(
      [400, 401, 403, 404, 409, 429, 503].map((n) => [n, c.ErrorResponseSchema]),
    );
    const security = [{ sessionCookie: [] }, { secureSessionCookie: [] }];
    const params = Type.Object(
      { coreId: Type.String({ format: 'uuid' }) },
      { additionalProperties: false },
    );
    const h = (cookie: string | undefined) => new Headers(cookie ? { cookie } : {});
    app.post(
      '/cores/:coreId/invitations',
      {
        schema: {
          operationId: 'issueInvitation',
          summary: 'Emitir convite',
          tags: ['platform'],
          security,
          params,
          body: c.EmptyRequestSchema,
          response: { 201: c.InvitationIssuedSchema, ...errors },
        },
      },
      async (req, reply) => {
        await service!.rate(req.ip);
        return reply.code(201).send(await service!.issue(h(req.headers.cookie), req.params.coreId));
      },
    );
    app.get(
      '/cores/:coreId/invitations',
      {
        schema: {
          operationId: 'listInvitations',
          summary: 'Consultar convites',
          tags: ['platform'],
          security,
          params,
          response: { 200: Type.Array(c.InvitationInfoSchema), ...errors },
        },
      },
      (req) => service!.list(h(req.headers.cookie), req.params.coreId),
    );
    app.delete(
      '/cores/:coreId/invitations/:invitationId',
      {
        schema: {
          operationId: 'revokeInvitation',
          summary: 'Revogar convite',
          tags: ['platform'],
          security,
          params: Type.Object(
            {
              coreId: Type.String({ format: 'uuid' }),
              invitationId: Type.String({ format: 'uuid' }),
            },
            { additionalProperties: false },
          ),
          response: { 204: { type: 'null' }, ...errors },
        },
      },
      async (req, reply) => {
        await service!.revoke(h(req.headers.cookie), req.params.coreId, req.params.invitationId);
        return reply.code(204).send(null);
      },
    );
    app.post(
      '/invitations/preview',
      {
        schema: {
          operationId: 'previewInvitation',
          summary: 'Consultar link de convite',
          tags: ['platform'],
          security: [],
          body: c.InvitationTokenSchema,
          response: { 200: c.InvitationPreviewSchema, ...errors },
        },
      },
      async (req) => {
        await service!.rate(req.ip);
        return service!.preview(req.body.token);
      },
    );
    app.post(
      '/invitations/accept',
      {
        schema: {
          operationId: 'acceptInvitation',
          summary: 'Aceitar convite',
          tags: ['platform'],
          security,
          body: c.InvitationTokenSchema,
          response: { 200: c.InvitationAcceptedSchema, ...errors },
        },
      },
      async (req) => {
        await service!.rate(req.ip);
        return service!.accept(h(req.headers.cookie), req.body.token);
      },
    );
    app.post(
      '/invitations/register',
      {
        schema: {
          operationId: 'registerInvitation',
          summary: 'Cadastrar e aceitar convite',
          tags: ['platform'],
          security: [],
          body: c.InvitationRegisterSchema,
          response: { 201: c.InvitationAcceptedSchema, ...errors },
        },
      },
      async (req, reply) => {
        await service!.rate(req.ip, true);
        return reply.code(201).send(await service!.register(req.body.token, req.body));
      },
    );
  };
}
