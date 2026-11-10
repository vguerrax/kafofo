import type { FastifyPluginAsync } from 'fastify';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import {
  EmptyRequestSchema,
  ErrorResponseSchema,
  LoginRequestSchema,
  PasswordRequestSchema,
  PublicUserSchema,
  SessionResponseSchema,
  SetupRequestSchema,
  SetupStateSchema,
} from '@kafofo/contracts';
import type { AuthService } from './service.js';
import { AuthError, unauthenticated, unavailable } from './policies.js';

export function authRoutes(
  service: AuthService | undefined,
  origin: string | undefined,
): FastifyPluginAsync {
  return async (instance) => {
    const app = instance.withTypeProvider<TypeBoxTypeProvider>();
    app.addHook('onRequest', async (request, reply) => {
      reply.header('Cache-Control', 'no-store');
      reply.header('Referrer-Policy', 'no-referrer');
      if (!service || !origin) throw unavailable();
      if (
        request.method !== 'GET' &&
        (request.headers.origin !== origin || request.headers['sec-fetch-site'] === 'cross-site')
      )
        throw new AuthError(403, 'UNTRUSTED_ORIGIN', 'Origem da requisição não permitida.');
    });
    const errors = {
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      409: ErrorResponseSchema,
      429: ErrorResponseSchema,
      503: ErrorResponseSchema,
    };
    const publicUser = (user: {
      id: string;
      username?: string | null | undefined;
      name: string;
      globalAdmin: boolean;
    }) => {
      if (!user.username) throw unavailable();
      return {
        id: user.id,
        username: user.username,
        name: user.name,
        globalAdmin: user.globalAdmin,
      };
    };
    const headers = (cookie: string | undefined) => new Headers(cookie ? { cookie } : {});
    app.get(
      '/setup',
      {
        schema: {
          operationId: 'getSetupState',
          summary: 'Consultar configuração da instalação',
          security: [],
          tags: ['platform'],
          response: { 200: SetupStateSchema, ...errors },
        },
      },
      async () => ({ configured: await service!.configured() }),
    );
    app.post(
      '/setup',
      {
        schema: {
          tags: ['platform'],
          body: SetupRequestSchema,
          operationId: 'configureInstallation',
          summary: 'Criar o primeiro administrador',
          security: [],
          response: { 201: SetupStateSchema, ...errors },
        },
      },
      async (request, reply) => {
        await service!.rate(request.ip, 'setup');
        await service!.bootstrap(request.body.code, request.body);
        return reply.code(201).send({ configured: true });
      },
    );
    app.post(
      '/login',
      {
        schema: {
          tags: ['platform'],
          body: LoginRequestSchema,
          operationId: 'login',
          summary: 'Entrar com usuário e senha',
          security: [],
          response: { 200: PublicUserSchema, ...errors },
        },
      },
      async (request, reply) => {
        const response = await service!.login(
          request.body,
          headers(request.headers.cookie),
          request.ip,
        );
        // O serviço só resolve depois de persistir a sessão.
        const result = (await response.json()) as { user: Parameters<typeof publicUser>[0] };
        reply.header('set-cookie', response.headers.getSetCookie());
        return publicUser(result.user);
      },
    );
    app.get(
      '/session',
      {
        schema: {
          operationId: 'getCurrentSession',
          summary: 'Consultar a própria sessão',
          security: [{ sessionCookie: [] }, { secureSessionCookie: [] }],
          tags: ['platform'],
          response: { 200: SessionResponseSchema, ...errors },
        },
      },
      async (request) => {
        const active = await service!.getSession(headers(request.headers.cookie));
        if (!active) throw unauthenticated();
        return { user: publicUser(active.user), expiresAt: active.session.expiresAt.toISOString() };
      },
    );
    app.post(
      '/logout',
      {
        schema: {
          tags: ['platform'],
          body: EmptyRequestSchema,
          operationId: 'logout',
          summary: 'Encerrar a própria sessão',
          security: [],
          response: { 204: { type: 'null', description: 'Sessão encerrada.' }, ...errors },
        },
      },
      async (request, reply) => {
        const response = await service!.logout(headers(request.headers.cookie));
        reply.header('set-cookie', response.headers.getSetCookie());
        return reply.code(204).send(null);
      },
    );
    app.post(
      '/password',
      {
        schema: {
          tags: ['platform'],
          body: PasswordRequestSchema,
          operationId: 'changePassword',
          summary: 'Trocar senha e encerrar outras sessões',
          security: [{ sessionCookie: [] }, { secureSessionCookie: [] }],
          response: { 204: { type: 'null', description: 'Senha alterada.' }, ...errors },
        },
      },
      async (request, reply) => {
        const result = await service!.changePassword(
          headers(request.headers.cookie),
          request.body.currentPassword,
          request.body.newPassword,
        );
        if ('error' in result) {
          reply.header('set-cookie', result.cookies);
          throw result.error;
        }
        reply.header('set-cookie', result.response.headers.getSetCookie());
        return reply.code(204).send(null);
      },
    );
  };
}
