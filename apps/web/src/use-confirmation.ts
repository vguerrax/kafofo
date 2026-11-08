import { useRef, useState } from 'react';
import type { MutationReceipt, ItemReceipt } from '@kafofo/contracts';
import { ApiError } from './api';
import { sendCommand, type PendingCommand } from './kitanda-api';
type Confirmation = MutationReceipt | ItemReceipt;
type Pending = { command: PendingCommand; after: (receipt: Confirmation) => Promise<void> };
export function useConfirmation(onError: (error: unknown) => void) {
  const [pending, setPending] = useState<Pending | null>(null),
    [busy, setBusy] = useState(false),
    [expired, setExpired] = useState(false),
    [reviewed, setReviewed] = useState(false);
  const active = useRef<Pending | null>(null),
    sending = useRef(false),
    generation = useRef(0);
  async function attempt(p: Pending) {
    if (sending.current) return;
    const current = generation.current;
    const wasPending = active.current === p;
    sending.current = true;
    setBusy(true);
    try {
      const result = await sendCommand(p.command);
      if (current !== generation.current) return;
      active.current = null;
      setPending(null);
      setExpired(false);
      await p.after(result);
    } catch (error) {
      if (current !== generation.current) return;
      const uncertain =
        !(error instanceof ApiError) || error.status >= 500 || (wasPending && error.status === 403);
      if (uncertain) {
        active.current = p;
        setPending(p);
      } else {
        active.current = null;
        setPending(null);
      }
      onError(error);
    } finally {
      sending.current = false;
      if (current === generation.current) setBusy(false);
    }
  }
  return {
    pending: pending?.command ?? null,
    busy,
    expired,
    reviewed,
    async execute(command: PendingCommand, after: Pending['after']) {
      if (active.current || sending.current) return;
      const p = { command, after };
      await attempt(p);
    },
    async retry() {
      const p = active.current;
      if (!p) return;
      if (Date.now() - p.command.startedAt >= 86400000) {
        setExpired(true);
        return;
      }
      await attempt(p);
    },
    async checked(refresh: () => Promise<void>) {
      try {
        await refresh();
        setReviewed(true);
      } catch (e) {
        onError(e);
      }
    },
    release() {
      if (!reviewed) return;
      active.current = null;
      setPending(null);
      setExpired(false);
      setReviewed(false);
    },
    reset() {
      generation.current++;
      active.current = null;
      setPending(null);
      setBusy(false);
      setExpired(false);
      setReviewed(false);
    },
    dispose() {
      generation.current++;
      active.current = null;
    },
  };
}
