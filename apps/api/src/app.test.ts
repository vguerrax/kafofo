import { Writable } from 'node:stream';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Type } from 'typebox';
import { Value } from 'typebox/value';
import { ErrorResponseSchema, HealthResponseSchema } from '@kafofo/contracts';
import { buildApp } from './app.js';
import { createLogger } from './logger.js';

const apps: Awaited<ReturnType<typeof buildApp>>[] = [];
afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

describe('contratos da API', () => {
  it('responde liveness sem banco e readiness indisponível sem expor conexão', async () => {
    const app = await buildApp();
    apps.push(app);
    const health = await app.inject('/api/health');
    expect(health.statusCode).toBe(200);
    expect(Value.Check(HealthResponseSchema, health.json())).toBe(true);
    const readiness = await app.inject('/api/ready');
    expect(readiness.statusCode).toBe(503);
    expect(Value.Check(ErrorResponseSchema, readiness.json())).toBe(true);
    expect(readiness.json().error.code).toBe('SERVICE_UNAVAILABLE');
  });

  it('consulta e encerra a conexão injetada no ciclo de vida', async () => {
    const database = { ping: vi.fn(async () => true), close: vi.fn(async () => undefined) };
    const app = await buildApp({ database });
    expect((await app.inject('/api/ready')).json()).toEqual({ status: 'ready' });
    await app.close();
    expect(database.ping).toHaveBeenCalledOnce();
    expect(database.close).toHaveBeenCalledOnce();
  });

  it('valida body em execução, não remove campos inesperados e padroniza erros', async () => {
    const app = await buildApp();
    apps.push(app);
    // Rota só do teste: prova o mecanismo de validação sem criar capacidade de produto.
    app.post(
      '/validation-probe',
      {
        schema: {
          body: Type.Object(
            { name: Type.String({ minLength: 1 }) },
            { additionalProperties: false },
          ),
        },
      },
      async (request) => request.body,
    );
    for (const payload of [{}, { name: 42 }, { name: 'ok', unexpected: 'sensitive' }]) {
      const response = await app.inject({ method: 'POST', url: '/validation-probe', payload });
      expect(response.statusCode).toBe(400);
      expect(Value.Check(ErrorResponseSchema, response.json())).toBe(true);
      expect(response.json().error.code).toBe('INVALID_REQUEST');
      expect(response.body).not.toContain('sensitive');
    }
  });

  it('não expõe detalhes internos e mantém o formato de erro no 404/500', async () => {
    const app = await buildApp();
    apps.push(app);
    app.get('/error-probe', () => {
      throw new Error('postgres://secret:password@private');
    });
    const missing = await app.inject('/not-found');
    const failure = await app.inject('/error-probe');
    expect(missing.statusCode).toBe(404);
    expect(failure.statusCode).toBe(500);
    expect(Value.Check(ErrorResponseSchema, missing.json())).toBe(true);
    expect(Value.Check(ErrorResponseSchema, failure.json())).toBe(true);
    expect(failure.body).not.toContain('password');
  });

  it('gera OpenAPI 3.1 a partir das rotas e não aceita request ID externo', async () => {
    const app = await buildApp();
    apps.push(app);
    const response = await app.inject({
      url: '/not-found',
      headers: { 'x-request-id': 'external' },
    });
    expect(response.json().error.requestId).not.toBe('external');
    const specification = (await app.inject('/api/openapi.json')).json();
    expect(specification.openapi).toBe('3.1.0');
    expect(specification.paths['/api/health'].get.responses['200']).toBeDefined();
    expect(specification.paths['/api/ready'].get.responses['503']).toBeDefined();
    expect(specification.paths['/api/openapi.json']).toBeUndefined();
  });
});

it('logs não incluem cabeçalhos, URL com token, payload ou mensagem de erro sensível', async () => {
  const lines: string[] = [];
  const stream = new Writable({
    write(chunk: Buffer, _encoding, callback) {
      lines.push(chunk.toString());
      callback();
    },
  });
  const logger = createLogger('info', stream);
  const app = await buildApp({ logger });
  apps.push(app);
  app.post('/logging-probe', () => {
    throw new Error('secret-error-marker');
  });
  await app.inject({
    method: 'POST',
    url: '/logging-probe?token=secret-query-marker',
    headers: {
      authorization: 'Bearer secret-header-marker',
      cookie: 'session=secret-cookie-marker',
    },
    payload: { password: 'secret-body-marker' },
  });
  logger.info(
    { password: 'secret-root-marker', nested: { token: 'secret-nested-marker' } },
    'redaction probe',
  );
  const logs = lines.join('');
  expect(logs).toContain('redaction probe');
  expect(logs).toContain('[REDACTED]');
  expect(logs).not.toMatch(/secret-(error|query|header|cookie|body|root|nested)-marker/);
});
