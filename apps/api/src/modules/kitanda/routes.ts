import type { FastifyPluginAsync } from 'fastify';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from 'typebox';
import * as c from '@kafofo/contracts';
import { AuthError, unavailable } from '../platform/public.js';
import type { KitandaService } from './service.js';
export function kitandaRoutes(
  service: KitandaService | undefined,
  origin: string | undefined,
): FastifyPluginAsync {
  return async (instance) => {
    const app = instance.withTypeProvider<TypeBoxTypeProvider>();
    app.addHook('onRequest', async (req, reply) => {
      reply.header('Cache-Control', 'no-store');
      if (!service || !origin) throw unavailable();
      if (
        req.method !== 'GET' &&
        (req.headers.origin !== origin || req.headers['sec-fetch-site'] === 'cross-site')
      )
        throw new AuthError(403, 'UNTRUSTED_ORIGIN', 'Origem da requisição não permitida.');
    });
    const errors = Object.fromEntries(
      [400, 401, 403, 404, 503].map((n) => [n, c.ErrorResponseSchema]),
    );
    const security = [{ sessionCookie: [] }, { secureSessionCookie: [] }],
      tags = ['kitanda'];
    const residence = Type.Object(
        { residenceId: Type.String({ format: 'uuid' }) },
        { additionalProperties: false },
      ),
      list = Type.Object(
        { listId: Type.String({ format: 'uuid' }) },
        { additionalProperties: false },
      ),
      share = Type.Object(
        {
          listId: Type.String({ format: 'uuid' }),
          residenceAccessId: Type.String({ format: 'uuid' }),
        },
        { additionalProperties: false },
      );
    const h = (cookie: string | undefined) => new Headers(cookie ? { cookie } : {});
    app.get(
      '/residences/:residenceId/lists',
      {
        schema: {
          operationId: 'listResidenceLists',
          summary: 'Consultar listas acessíveis',
          tags,
          security,
          params: residence,
          response: { 200: Type.Array(c.ListCardSchema), ...errors },
        },
      },
      (req) => service!.collection(h(req.headers.cookie), req.params.residenceId),
    );
    app.post(
      '/residences/:residenceId/lists',
      {
        schema: {
          operationId: 'createList',
          summary: 'Criar lista privada',
          tags,
          security,
          params: residence,
          body: c.ListCreateSchema,
          response: { 201: c.ListInfoSchema, ...errors },
        },
      },
      async (req, reply) =>
        reply
          .code(201)
          .send(await service!.create(h(req.headers.cookie), req.params.residenceId, req.body)),
    );
    app.get(
      '/lists/:listId',
      {
        schema: {
          operationId: 'getList',
          summary: 'Consultar lista',
          tags,
          security,
          params: list,
          response: { 200: c.ListInfoSchema, ...errors },
        },
      },
      (req) => service!.detail(h(req.headers.cookie), req.params.listId),
    );
    app.patch(
      '/lists/:listId',
      {
        schema: {
          operationId: 'updateList',
          summary: 'Editar metadados da lista',
          tags,
          security,
          params: list,
          body: c.ListUpdateSchema,
          response: { 200: c.ListInfoSchema, ...errors },
        },
      },
      (req) => service!.update(h(req.headers.cookie), req.params.listId, req.body),
    );
    app.get(
      '/lists/:listId/share-candidates',
      {
        schema: {
          operationId: 'listShareCandidates',
          summary: 'Consultar candidatos da residência',
          tags,
          security,
          params: list,
          response: { 200: Type.Array(c.ShareCandidateSchema), ...errors },
        },
      },
      (req) => service!.candidates(h(req.headers.cookie), req.params.listId),
    );
    app.get(
      '/lists/:listId/shares',
      {
        schema: {
          operationId: 'listShares',
          summary: 'Consultar compartilhamentos vigentes',
          tags,
          security,
          params: list,
          response: { 200: Type.Array(c.ListShareSchema), ...errors },
        },
      },
      (req) => service!.shares(h(req.headers.cookie), req.params.listId),
    );
    app.put(
      '/lists/:listId/shares/:residenceAccessId',
      {
        schema: {
          operationId: 'shareList',
          summary: 'Compartilhar lista com vínculo ativo',
          tags,
          security,
          params: share,
          response: { 204: { type: 'null' }, ...errors },
        },
      },
      async (req, reply) => {
        await service!.share(
          h(req.headers.cookie),
          req.params.listId,
          req.params.residenceAccessId,
        );
        return reply.code(204).send(null);
      },
    );
    app.delete(
      '/lists/:listId/shares/:residenceAccessId',
      {
        schema: {
          operationId: 'revokeListShare',
          summary: 'Revogar compartilhamento',
          tags,
          security,
          params: share,
          response: { 204: { type: 'null' }, ...errors },
        },
      },
      async (req, reply) => {
        await service!.revoke(
          h(req.headers.cookie),
          req.params.listId,
          req.params.residenceAccessId,
        );
        return reply.code(204).send(null);
      },
    );
  };
}
