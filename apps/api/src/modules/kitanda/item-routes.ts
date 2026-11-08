import type { FastifyPluginAsync } from 'fastify';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from 'typebox';
import * as c from '@kafofo/contracts';
import { AuthError, unavailable } from '../platform/public.js';
import type { ItemService } from './items.js';
export function itemRoutes(
  service: ItemService | undefined,
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
    const list = Type.Object(
        { listId: Type.String({ format: 'uuid' }) },
        { additionalProperties: false },
      ),
      item = Type.Object(
        { ...list.properties, itemId: Type.String({ format: 'uuid' }) },
        { additionalProperties: false },
      );
    const h = (cookie: string | undefined) => new Headers(cookie ? { cookie } : {});
    app.get(
      '/lists/:listId/items',
      {
        schema: {
          operationId: 'listItems',
          summary: 'Consultar itens ativos',
          tags,
          security,
          params: list,
          response: { 200: Type.Array(c.ItemInfoSchema), ...errors },
        },
      },
      (req) => service!.collection(h(req.headers.cookie), req.params.listId),
    );
    app.post(
      '/lists/:listId/items',
      {
        schema: {
          operationId: 'createItem',
          summary: 'Adicionar item pendente',
          tags,
          security,
          params: list,
          body: c.ItemCreateSchema,
          response: { 201: c.ItemInfoSchema, ...errors },
        },
      },
      async (req, reply) =>
        reply
          .code(201)
          .send(await service!.create(h(req.headers.cookie), req.params.listId, req.body)),
    );
    app.patch(
      '/lists/:listId/items/:itemId',
      {
        schema: {
          operationId: 'updateItem',
          summary: 'Editar metadados do item',
          tags,
          security,
          params: item,
          body: c.ItemUpdateSchema,
          response: { 200: c.ItemInfoSchema, ...errors },
        },
      },
      (req) =>
        service!.update(h(req.headers.cookie), req.params.listId, req.params.itemId, req.body),
    );
    app.delete(
      '/lists/:listId/items/:itemId',
      {
        schema: {
          operationId: 'removeItem',
          summary: 'Remover item logicamente',
          tags,
          security,
          params: item,
          response: { 204: { type: 'null' }, ...errors },
        },
      },
      async (req, reply) => {
        await service!.remove(h(req.headers.cookie), req.params.listId, req.params.itemId);
        return reply.code(204).send(null);
      },
    );
    app.put(
      '/lists/:listId/items/:itemId/purchased',
      {
        schema: {
          operationId: 'setItemPurchased',
          summary: 'Definir estado de compra desejado',
          tags,
          security,
          params: item,
          body: c.ItemPurchasedSchema,
          response: { 200: c.ItemInfoSchema, ...errors },
        },
      },
      (req) =>
        service!.purchased(
          h(req.headers.cookie),
          req.params.listId,
          req.params.itemId,
          req.body.purchased,
        ),
    );
  };
}
