import type pg from 'pg';
import { afterEach, expect, it, vi } from 'vitest';
import { retentionMaintenance } from './retention.js';
afterEach(() => vi.useRealTimers());
it('agenda inicial/horário sem sobreposição e espera execução antes de fechar', async () => {
  vi.useFakeTimers();
  let finish!: (v: { rows: never[] }) => void;
  const query = vi.fn(
    () =>
      new Promise<{ rows: never[] }>((resolve) => {
        finish = resolve;
      }),
  );
  const maintenance = retentionMaintenance({ pool: { query } as unknown as pg.Pool });
  const onError = vi.fn();
  maintenance.startPurge(onError);
  maintenance.startPurge(onError);
  expect(query).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(3600000);
  expect(query).toHaveBeenCalledTimes(1);
  finish({ rows: [] });
  await vi.advanceTimersByTimeAsync(3600000);
  expect(query).toHaveBeenCalledTimes(2);
  let closed = false;
  const closing = maintenance.closePurge().then(() => {
    closed = true;
  });
  await Promise.resolve();
  expect(closed).toBe(false);
  finish({ rows: [] });
  await closing;
  await vi.advanceTimersByTimeAsync(3600000);
  expect(query).toHaveBeenCalledTimes(2);
  expect(onError).not.toHaveBeenCalled();
});
it('falha de consulta é reportada e próxima execução retoma candidatos', async () => {
  vi.useFakeTimers();
  const query = vi
    .fn()
    .mockRejectedValueOnce(new Error('indisponível'))
    .mockResolvedValue({ rows: [] });
  const maintenance = retentionMaintenance({ pool: { query } as unknown as pg.Pool }),
    onError = vi.fn();
  maintenance.startPurge(onError);
  await vi.advanceTimersByTimeAsync(0);
  expect(onError).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(3600000);
  expect(query).toHaveBeenCalledTimes(2);
  await maintenance.closePurge();
});
