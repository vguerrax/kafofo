import type pg from 'pg';
import type { HistoryDetails } from '@kafofo/contracts';
import { expect, it, vi } from 'vitest';
import { changes, recordHistory } from './history-record.js';
it('diferenças preservam null e registram somente mudanças efetivas', () => {
  expect(
    changes({ name: 'A', description: null as string | null }, { name: 'A', description: 'B' }),
  ).toEqual({ description: { before: null, after: 'B' } });
  expect(changes({ name: 'A' }, { name: 'A' })).toEqual({});
  expect(changes(null, { name: 'A', quantity: null })).toEqual({
    name: { before: null, after: 'A' },
  });
});
it('contrato do escritor recusa campo estranho antes de persistir conteúdo', async () => {
  const query = vi.fn();
  await expect(
    recordHistory({ query } as unknown as pg.PoolClient, {
      listId: crypto.randomUUID(),
      actorId: 'ator',
      action: 'list.created',
      details: { password: 'segredo' } as unknown as HistoryDetails,
    }),
  ).rejects.toThrow('Detalhes de histórico inválidos');
  expect(query).not.toHaveBeenCalled();
});
