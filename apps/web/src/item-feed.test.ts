import { afterEach, expect, it, vi } from 'vitest';
import { createItemFeed } from './item-feed';
afterEach(() => vi.useRealTimers());
it('cadência de cinco segundos, pausa oculta e retorno imediato', async () => {
  vi.useFakeTimers();
  let visible = true;
  const load = vi.fn(async () => 1),
    value = vi.fn();
  const feed = createItemFeed({
    load,
    visible: () => visible,
    onValue: value,
    onError: vi.fn(),
    onBlocked: vi.fn(),
  });
  feed.start();
  await vi.advanceTimersByTimeAsync(0);
  expect(load).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(4999);
  expect(load).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(1);
  expect(load).toHaveBeenCalledTimes(2);
  visible = false;
  feed.visibilityChanged();
  await vi.advanceTimersByTimeAsync(15000);
  expect(load).toHaveBeenCalledTimes(2);
  visible = true;
  await feed.visibilityChanged();
  expect(load).toHaveBeenCalledTimes(3);
  feed.stop();
});
it('uma consulta ativa e resposta anterior à mutação não repovoa leitura', async () => {
  vi.useFakeTimers();
  let resolve!: (n: number) => void;
  const load = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<number>((r) => {
            resolve = r;
          }),
      )
      .mockResolvedValue(2),
    value = vi.fn();
  const feed = createItemFeed({
    load,
    visible: () => true,
    onValue: value,
    onError: vi.fn(),
    onBlocked: vi.fn(),
  });
  feed.start();
  await vi.advanceTimersByTimeAsync(10000);
  expect(load).toHaveBeenCalledTimes(1);
  const refresh = feed.refresh(true);
  resolve(1);
  await refresh;
  expect(value).toHaveBeenCalledTimes(1);
  expect(value).toHaveBeenCalledWith(2);
  feed.stop();
});
it('bloqueio encerra consultas e resposta de contexto desmontado é descartada', async () => {
  vi.useFakeTimers();
  const blocked = vi.fn(),
    load = vi.fn().mockRejectedValue({ status: 404 }),
    value = vi.fn();
  const feed = createItemFeed({
    load,
    visible: () => true,
    onValue: value,
    onError: vi.fn(),
    onBlocked: blocked,
  });
  feed.start();
  await vi.advanceTimersByTimeAsync(10000);
  expect(load).toHaveBeenCalledTimes(1);
  expect(blocked).toHaveBeenCalledTimes(1);
  await feed.refresh();
  expect(load).toHaveBeenCalledTimes(1);
  let resolve!: (n: number) => void;
  const other = createItemFeed({
    load: () =>
      new Promise<number>((r) => {
        resolve = r;
      }),
    visible: () => true,
    onValue: value,
    onError: vi.fn(),
    onBlocked: blocked,
  });
  other.start();
  other.stop();
  resolve(1);
  await vi.advanceTimersByTimeAsync(0);
  expect(value).not.toHaveBeenCalled();
});
