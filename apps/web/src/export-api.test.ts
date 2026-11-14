import { afterEach, expect, it, vi } from 'vitest';
import { requestIndividualExport } from './export-api';
const file = {
  schemaVersion: 1,
  generatedAt: '2026-11-10T12:00:00.000Z',
  profile: { username: 'export-owner', name: 'Own name', createdAt: '2026-11-01T12:00:00.000Z' },
  memberships: [],
  securityEvents: [],
  kitandaActions: [],
};
const headers = {
  'Content-Type': 'application/json',
  'Content-Disposition': 'attachment; filename="kafofo-dados-2026-11-10.json"',
};
afterEach(() => vi.unstubAllGlobals());
it('solicita somente senha e valida o anexo antes de devolver bytes para download', async () => {
  const fetch = vi.fn(async () => new Response(JSON.stringify(file), { headers }));
  vi.stubGlobal('fetch', fetch);
  const signal = new AbortController().signal;
  const result = await requestIndividualExport('password-for-request', signal);
  expect(fetch).toHaveBeenCalledWith(
    '/api/account/export',
    expect.objectContaining({
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      signal,
      body: JSON.stringify({ password: 'password-for-request' }),
    }),
  );
  expect(result.filename).toBe('kafofo-dados-2026-11-10.json');
  expect(JSON.parse(await result.blob.text())).toEqual(file);
});
it('recusa JSON de erro, documento com campos extras, tipo inesperado e ausência de anexo', async () => {
  for (const response of [
    new Response(JSON.stringify({ error: { message: 'wrong' } }), { headers }),
    new Response(JSON.stringify({ ...file, token: 'forbidden' }), { headers }),
    new Response(JSON.stringify({ ...file, profile: { ...file.profile, password: 'forbidden' } }), {
      headers,
    }),
    new Response('<html>unavailable</html>', {
      headers: { ...headers, 'Content-Type': 'text/html' },
    }),
    new Response(JSON.stringify(file), { headers: { 'Content-Type': 'application/json' } }),
  ]) {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => response),
    );
    await expect(requestIndividualExport('password', new AbortController().signal)).rejects.toThrow(
      'Não foi possível validar o arquivo',
    );
  }
});
it('preserva a distinção de falhas HTTP e não devolve arquivo', async () => {
  for (const status of [400, 401, 429, 503]) {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ error: { message: 'failure' } }), {
            status,
            headers: { 'Content-Type': 'application/json' },
          }),
      ),
    );
    await expect(
      requestIndividualExport('password', new AbortController().signal),
    ).rejects.toMatchObject({ status, message: 'failure' });
  }
});
