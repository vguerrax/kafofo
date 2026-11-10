import { expect, it } from 'vitest';
import { buildApp } from '../../../app.js';
import type { IndividualExport } from '@kafofo/contracts';
it('falha de serialização remove o cabeçalho de anexo e não entrega dados parciais', async () => {
  const app = await buildApp({
    authOrigin: 'https://kafofo.example',
    individualExport: {
      download: async () =>
        ({
          generatedAt: '2026-11-10T00:00:00Z',
          schemaVersion: 1,
          profile: { username: 'own' },
          memberships: [],
          securityEvents: [],
          kitandaActions: [],
        }) as unknown as IndividualExport,
    },
  });
  try {
    const response = await app.inject({
      method: 'POST',
      url: '/api/account/export',
      headers: { origin: 'https://kafofo.example' },
      payload: { password: 'fake' },
    });
    expect(response.statusCode).toBe(500);
    expect(response.headers['content-disposition']).toBeUndefined();
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body).not.toContain('profile');
  } finally {
    await app.close();
  }
});
