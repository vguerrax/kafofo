import { useEffect, useRef, useState } from 'react';
import type { ListInfo, TrashList } from '@kafofo/contracts';
import { ApiError } from './api';
import { kitandaApi, prepareCommand } from './kitanda-api';
import { createItemFeed } from './item-feed';
import { useConfirmation } from './use-confirmation';
import { PendingNotice } from './PendingNotice';
import { ConfirmationDialog } from './ConfirmationDialog';

type Selection = { kind: 'remove' | 'restore'; id: string; name: string; revision: number };
export function ListLifecyclePanel({
  residenceId,
  list,
  onRemoving,
  onChanged,
  onUnauthenticated,
}: {
  residenceId: string;
  list: ListInfo | null;
  onRemoving: () => void;
  onChanged: () => Promise<void>;
  onUnauthenticated: () => void;
}) {
  const [open, setOpen] = useState(false),
    [rows, setRows] = useState<TrashList[]>([]),
    [selection, setSelection] = useState<Selection | null>(null),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [canConfirm, setCanConfirm] = useState(true);
  const target = useRef<string | null>(null),
    reads = useRef(0),
    feed = useRef<ReturnType<
      typeof createItemFeed<{ rows: TrashList[]; canWrite: boolean }>
    > | null>(null),
    trigger = useRef<HTMLButtonElement | null>(null),
    callbacks = useRef({ onChanged, onUnauthenticated });
  useEffect(() => {
    callbacks.current = { onChanged, onUnauthenticated };
  }, [onChanged, onUnauthenticated]);
  const command = useConfirmation(failure);
  const lifetime = useRef(command);
  useEffect(() => () => lifetime.current.dispose(), []);
  function failure(e: unknown) {
    setError(e instanceof Error ? e.message : 'Não foi possível confirmar a operação.');
    if (e instanceof ApiError && e.status === 401) block(e.status);
    else if (e instanceof ApiError && [403, 404, 409].includes(e.status))
      void feed.current?.refresh(true);
  }
  function block(status: number) {
    target.current = null;
    command.reset();
    setRows([]);
    setSelection(null);
    setOpen(false);
    setError('A lixeira ou a lista não está mais disponível para você.');
    if (status === 401) callbacks.current.onUnauthenticated();
    else void callbacks.current.onChanged();
  }
  const monitoring = open || Boolean(selection) || Boolean(command.pending) || command.busy;
  useEffect(() => {
    if (!monitoring) return;
    const controller = createItemFeed({
      visible: () => document.visibilityState === 'visible',
      load: async () => {
        const trash = await kitandaApi.trash(residenceId);
        let canWrite = true;
        if (target.current) {
          const deleted = trash.find((r) => r.id === target.current);
          canWrite = deleted
            ? deleted.canWrite
            : (await kitandaApi.detail(target.current)).canWrite;
        }
        return { rows: trash, canWrite };
      },
      onValue: (value) => {
        reads.current++;
        setRows(value.rows);
        setCanConfirm(value.canWrite);
      },
      onError: () =>
        setError('Não foi possível atualizar a lixeira. Os dados podem estar desatualizados.'),
      onBlocked: (status) => block(status),
    });
    feed.current = controller;
    controller.start();
    const check = () => void controller.visibilityChanged();
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', check);
    return () => {
      controller.stop();
      feed.current = null;
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', check);
    };
    // O monitor pertence à residência. Alvo e callbacks atuais ficam em referências.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residenceId, monitoring]);
  function choose(value: Selection, button: HTMLButtonElement) {
    target.current = value.id;
    setCanConfirm(true);
    trigger.current = button;
    setSelection(value);
    setError('');
  }
  function cancel(clearTarget = true) {
    if (clearTarget) target.current = null;
    setSelection(null);
    trigger.current?.focus();
  }
  function confirm() {
    if (!selection) return;
    const selected = selection;
    target.current = selected.id;
    setCanConfirm(true);
    cancel(false);
    if (selected.kind === 'remove') onRemoving();
    void command.execute(
      prepareCommand(
        '/lists/' + selected.id + (selected.kind === 'restore' ? '/restore' : ''),
        selected.kind === 'restore' ? 'POST' : 'DELETE',
        { expectedRevision: selected.revision },
      ),
      async () => {
        target.current = null;
        setError('');
        setNotice(selected.kind === 'remove' ? 'Lista enviada à lixeira.' : 'Lista restaurada.');
        await feed.current?.refresh(true);
        await callbacks.current.onChanged();
      },
    );
  }
  const disabled = command.busy || Boolean(command.pending);
  return (
    <section aria-label="Ciclo das listas">
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      {list?.canWrite && (
        <button
          disabled={disabled}
          onClick={(e) =>
            choose(
              { kind: 'remove', id: list.id, name: list.name, revision: list.lifecycleRevision },
              e.currentTarget,
            )
          }
        >
          Excluir lista
        </button>
      )}
      <button
        onClick={() => {
          setOpen(!open);
          setRows([]);
          if (!open) void feed.current?.refresh(true);
        }}
      >
        {open ? 'Fechar lixeira' : 'Abrir lixeira'}
      </button>
      <PendingNotice
        state={command}
        canWrite={canConfirm}
        onCheck={async () => {
          const before = reads.current;
          await feed.current?.refresh(true);
          await callbacks.current.onChanged();
          if (reads.current === before)
            throw new Error('Atualização não confirmada. Tente novamente.');
        }}
      />
      {open && (
        <section aria-label="Lixeira da residência">
          <h4>Lixeira da residência</h4>
          <p>
            Listas podem ser restauradas antes de completar 30 dias da exclusão. Itens removidos
            anteriormente permanecem removidos.
          </p>
          <button onClick={() => void feed.current?.refresh()}>Atualizar lixeira</button>
          {!rows.length && <p>Nenhuma lista recuperável acessível.</p>}
          <ul>
            {rows.map((r) => (
              <li key={r.id}>
                <p>{r.name}</p>
                <p>
                  Recuperável até{' '}
                  <time dateTime={r.recoverableUntil}>
                    {new Date(r.recoverableUntil).toLocaleString('pt-BR')}
                  </time>
                </p>
                {r.canWrite && (
                  <button
                    disabled={disabled}
                    onClick={(e) =>
                      choose(
                        { kind: 'restore', id: r.id, name: r.name, revision: r.lifecycleRevision },
                        e.currentTarget,
                      )
                    }
                  >
                    Restaurar {r.name}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      {selection && (
        <ConfirmationDialog
          title={
            selection.kind === 'remove' ? 'Confirmar exclusão da lista' : 'Confirmar restauração'
          }
          confirmLabel={
            selection.kind === 'remove' ? 'Confirmar exclusão' : 'Confirmar restauração'
          }
          onCancel={() => cancel()}
          onConfirm={confirm}
          confirmDisabled={!canConfirm || disabled}
        >
          <p>
            {selection.kind === 'remove' ? 'Enviar à lixeira' : 'Restaurar'}: {selection.name}?
          </p>
          <p>
            {selection.kind === 'remove'
              ? 'A lista ficará indisponível no uso ativo e poderá ser recuperada por 30 dias.'
              : 'Itens já removidos e compartilhamentos revogados não serão recuperados.'}
          </p>
        </ConfirmationDialog>
      )}
    </section>
  );
}
