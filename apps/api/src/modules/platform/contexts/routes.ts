import type { FastifyPluginAsync, FastifyRequest, HTTPMethods } from 'fastify';
import { Type } from 'typebox';
import * as contracts from '@kafofo/contracts';
import type { ContextService } from './service.js';
import { AuthError, unavailable } from '../auth/policies.js';
export function contextRoutes(
  service: ContextService | undefined,
  origin: string | undefined,
): FastifyPluginAsync {
  return async (app) => {
    app.addHook('onRequest', async (req, reply) => {
      reply.header('Cache-Control', 'no-store');
      if (!service || !origin) throw unavailable();
      if (
        req.method !== 'GET' &&
        (req.headers.origin !== origin || req.headers['sec-fetch-site'] === 'cross-site')
      )
        throw new AuthError(403, 'UNTRUSTED_ORIGIN', 'Origem da requisição não permitida.');
    });
    type Request = FastifyRequest<{
      Params: Record<string, string>;
      Body: {
        name: string;
        responsibleUserId: string;
        role: contracts.CoreRole | contracts.ResidenceRole;
      };
    }>;
    const h = (r: Request) => new Headers(r.headers.cookie ? { cookie: r.headers.cookie } : {});
    const core = (r: Request) => r.params['coreId']!,
      res = (r: Request) => r.params['residenceId']!,
      user = (r: Request) => r.params['userId']!;
    const errors = Object.fromEntries(
      [400, 401, 403, 404, 409, 503].map((code) => [code, contracts.ErrorResponseSchema]),
    );
    function route(
      method: HTTPMethods,
      url: string,
      operationId: string,
      response: object,
      fn: (r: Request) => Promise<unknown>,
      body?: object,
      created = false,
    ) {
      const properties = Object.fromEntries(
        [...url.matchAll(/:(\w+)/g)].map((match) => [
          match[1]!,
          Type.String(
            match[1] === 'userId' ? { minLength: 1, maxLength: 128 } : { format: 'uuid' },
          ),
        ]),
      );
      app.route<{ Params: Record<string, string>; Body: Request['body'] }>({
        method,
        url,
        schema: {
          operationId,
          summary: operationId,
          tags: ['platform'],
          security: [{ sessionCookie: [] }, { secureSessionCookie: [] }],
          params: Type.Object(properties, { additionalProperties: false }),
          ...(body ? { body } : {}),
          response: {
            [method === 'DELETE' || method === 'PATCH' || method === 'PUT'
              ? 204
              : created
                ? 201
                : 200]: response,
            ...errors,
          },
        },
        handler: async (req, reply) => {
          const result = await fn(req);
          if (method === 'DELETE' || method === 'PATCH' || method === 'PUT')
            return reply.code(204).send(null);
          return reply.code(created ? 201 : 200).send(result);
        },
      });
    }
    const none = { type: 'null' };
    route('GET', '/contexts', 'getContexts', contracts.ContextsSchema, (r) =>
      service!.contexts(h(r)),
    );
    route(
      'POST',
      '/cores',
      'createCore',
      contracts.CoreInfoSchema,
      (r) => service!.createCore(h(r), r.body.name),
      contracts.ContextNameRequestSchema,
      true,
    );
    route(
      'GET',
      '/cores/:coreId/members',
      'getCoreMembers',
      Type.Array(contracts.MemberInfoSchema),
      (r) => service!.members(h(r), core(r)),
    );
    route(
      'PATCH',
      '/cores/:coreId/members/:userId',
      'setMemberRole',
      none,
      (r) => service!.setMemberRole(h(r), core(r), user(r), r.body.role as contracts.CoreRole),
      contracts.MemberRoleRequestSchema,
    );
    route('DELETE', '/cores/:coreId/members/:userId', 'removeCoreMember', none, (r) =>
      service!.removeMember(h(r), core(r), user(r)),
    );
    route(
      'GET',
      '/cores/:coreId/residences',
      'getCoreResidences',
      Type.Array(contracts.ResidenceInfoSchema),
      (r) => service!.residences(h(r), core(r)),
    );
    route(
      'POST',
      '/cores/:coreId/residences',
      'createResidence',
      contracts.CreatedResidenceSchema,
      (r) => service!.createResidence(h(r), core(r), r.body),
      contracts.ResidenceRequestSchema,
      true,
    );
    route('GET', '/residences/:residenceId', 'getResidence', contracts.ResidenceInfoSchema, (r) =>
      service!.residence(h(r), res(r)),
    );
    route(
      'GET',
      '/residences/:residenceId/accesses',
      'getResidenceAccesses',
      Type.Array(contracts.AccessInfoSchema),
      (r) => service!.accesses(h(r), res(r)),
    );
    route(
      'PUT',
      '/residences/:residenceId/accesses/:userId',
      'setResidenceAccess',
      none,
      (r) => service!.setAccess(h(r), res(r), user(r), r.body.role as contracts.ResidenceRole),
      contracts.AccessRoleRequestSchema,
    );
    route(
      'DELETE',
      '/residences/:residenceId/accesses/:userId',
      'removeResidenceAccess',
      none,
      (r) => service!.removeAccess(h(r), res(r), user(r)),
    );
  };
}
