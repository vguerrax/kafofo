// Coordenador da consulta de uma lista. Mutação/contexto invalidam respostas antigas.
export function createItemFeed<T>(options: {
  load: () => Promise<T>;
  visible: () => boolean;
  onValue: (value: T) => void;
  onError: (error: unknown) => void;
  onBlocked: (status: number) => void;
}) {
  let generation = 0,
    stopped = false,
    blocked = false,
    queued = false,
    running: Promise<void> | null = null,
    timer: ReturnType<typeof setInterval> | undefined;
  function statusOf(error: unknown) {
    return error && typeof error === 'object' && 'status' in error ? Number(error.status) : 0;
  }
  async function drain() {
    while (queued && !stopped && !blocked && options.visible()) {
      queued = false;
      const current = generation;
      try {
        const value = await options.load();
        if (current === generation && !stopped && !blocked) options.onValue(value);
      } catch (error) {
        if (current === generation && !stopped && !blocked) {
          const status = statusOf(error);
          if ([401, 403, 404].includes(status)) {
            blocked = true;
            queued = false;
            generation++;
            if (timer) clearInterval(timer);
            options.onBlocked(status);
          } else options.onError(error);
        }
      }
    }
  }
  function refresh(invalidate = false, queue = true): Promise<void> {
    if (invalidate) generation++;
    if (stopped || blocked || !options.visible()) return Promise.resolve();
    if (running) {
      if (queue) queued = true;
      return running;
    }
    queued = true;
    running = drain().finally(() => {
      running = null;
    });
    return running;
  }
  return {
    refresh,
    start() {
      if (stopped || blocked || timer) return;
      void refresh();
      timer = setInterval(() => void refresh(false, false), 5000);
    },
    visibilityChanged() {
      generation++;
      queued = false;
      return options.visible() ? refresh() : Promise.resolve();
    },
    stop() {
      stopped = true;
      generation++;
      queued = false;
      if (timer) clearInterval(timer);
    },
  };
}
