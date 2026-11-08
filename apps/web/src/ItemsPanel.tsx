import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { ItemInfo, ItemSnapshot } from '@kafofo/contracts';
import { itemApi, prepareCommand } from './kitanda-api';
import { ApiError } from './api';
import { quantityInput, progressLabel } from './item-format';
import { createItemFeed } from './item-feed';
import { useConfirmation } from './use-confirmation';
import { PendingNotice } from './PendingNotice';
type Draft = { name: string; quantity: string; unit: string; notes: string };
const empty = (): Draft => ({ name: '', quantity: '', unit: '', notes: '' });
const draftOf = (r: ItemInfo): Draft => ({
  name: r.name,
  quantity: r.quantity?.replace('.', ',') ?? '',
  unit: r.unit ?? '',
  notes: r.notes ?? '',
});
const payload = (d: Draft) => ({
  name: d.name,
  quantity: quantityInput(d.quantity),
  unit: d.unit || null,
  notes: d.notes || null,
});
function Fields({
  prefix,
  values,
  onChange,
  edit = false,
}: {
  prefix: string;
  values: Draft;
  onChange: (draft: Draft) => void;
  edit?: boolean;
}) {
  return (
    <>
      {(['name', 'quantity', 'unit', 'notes'] as const).map((key) => {
        const label =
            { name: 'Nome', quantity: 'Quantidade', unit: 'Unidade', notes: 'Observação' }[key] +
            (edit ? ' do item' : ' do novo item'),
          id = prefix + '-' + key;
        return (
          <div key={key}>
            <label htmlFor={id}>{label}</label>
            {key === 'notes' ? (
              <textarea
                id={id}
                value={values[key]}
                onChange={(e) => onChange({ ...values, [key]: e.target.value })}
                maxLength={8192}
              />
            ) : (
              <input
                id={id}
                value={values[key]}
                onChange={(e) => onChange({ ...values, [key]: e.target.value })}
                required={key === 'name'}
                inputMode={key === 'quantity' ? 'decimal' : 'text'}
                maxLength={key === 'quantity' ? 1024 : 8192}
              />
            )}
          </div>
        );
      })}
    </>
  );
}
export function ItemsPanel({
  listId,
  canWrite,
  onSnapshot,
  onBlocked,
  onConfirmed,
}: {
  listId: string;
  canWrite: boolean;
  onSnapshot: (snapshot: ItemSnapshot) => void;
  onBlocked: (status: number) => void;
  onConfirmed: () => Promise<void>;
}) {
  const [rows, setRows] = useState<ItemInfo[]>([]),
    [newDraft, setNewDraft] = useState<Draft>(empty),
    [editor, setEditor] = useState<{ id: string; baseVersion: number; draft: Draft } | null>(null),
    [error, setError] = useState(''),
    [stale, setStale] = useState('');
  const feed = useRef<ReturnType<typeof createItemFeed<ItemSnapshot>> | null>(null),
    callbacks = useRef({ onSnapshot, onBlocked, onConfirmed }),
    lastRead = useRef(0);
  useEffect(() => {
    callbacks.current = { onSnapshot, onBlocked, onConfirmed };
  }, [onSnapshot, onBlocked, onConfirmed]);
  const command = useConfirmation(failure);
  function failure(e: unknown) {
    setError(e instanceof Error ? e.message : 'Não foi possível confirmar o salvamento.');
    if (e instanceof ApiError && e.status === 401) block(e.status);
    else if (e instanceof ApiError && [403, 404, 409].includes(e.status))
      void feed.current?.refresh(true);
  }
  function block(status: number) {
    feed.current?.stop();
    command.reset();
    setRows([]);
    setEditor(null);
    setNewDraft(empty());
    callbacks.current.onBlocked(status);
  }
  useEffect(() => {
    const controller = createItemFeed({
      load: () => itemApi.snapshot(listId),
      visible: () => document.visibilityState === 'visible',
      onValue: (snapshot: ItemSnapshot) => {
        lastRead.current++;
        setRows(snapshot.items);
        setStale('');
        callbacks.current.onSnapshot(snapshot);
      },
      onError: () =>
        setStale(
          'Não foi possível atualizar. Os dados podem estar desatualizados; seu preenchimento foi preservado.',
        ),
      onBlocked: (status) => block(status),
    });
    feed.current = controller;
    const confirmation = command;
    controller.start();
    const visible = () => void controller.visibilityChanged();
    window.addEventListener('focus', visible);
    document.addEventListener('visibilitychange', visible);
    return () => {
      controller.stop();
      confirmation.dispose();
      window.removeEventListener('focus', visible);
      document.removeEventListener('visibilitychange', visible);
    };
    // O controlador pertence somente a esta lista; callbacks usam referências atuais.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId]);
  const disabled = command.busy || Boolean(command.pending) || !canWrite;
  const current = editor ? rows.find((r) => r.id === editor.id) : undefined,
    changed = Boolean(editor && current && current.version !== editor.baseVersion);
  async function confirmed() {
    setError('');
    const reading = feed.current?.refresh(true);
    await callbacks.current.onConfirmed();
    await reading;
  }
  async function check() {
    const before = lastRead.current;
    await feed.current?.refresh(true);
    if (lastRead.current === before)
      throw new Error('Atualização não confirmada. Tente novamente.');
  }
  function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (disabled) return;
    void command.execute(
      prepareCommand('/lists/' + listId + '/items', 'POST', payload(newDraft)),
      async () => {
        setNewDraft(empty());
        await confirmed();
      },
    );
  }
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (disabled || !editor || !current || changed) return;
    void command.execute(
      prepareCommand('/lists/' + listId + '/items/' + editor.id, 'PATCH', {
        ...payload(editor.draft),
        expectedVersion: editor.baseVersion,
      }),
      async () => {
        setEditor(null);
        await confirmed();
      },
    );
  }
  function mutate(item: ItemInfo, remove = false) {
    if (disabled) return;
    void command.execute(
      prepareCommand(
        '/lists/' + listId + '/items/' + item.id + (remove ? '' : '/purchased'),
        remove ? 'DELETE' : 'PUT',
        { expectedVersion: item.version, ...(remove ? {} : { purchased: !item.purchased }) },
      ),
      confirmed,
    );
  }
  return (
    <section aria-label="Itens da lista">
      <h5>Itens da lista</h5>
      <p>{progressLabel(rows.length, rows.filter((r) => r.purchased).length)}</p>
      {stale && <p role="status">{stale}</p>}
      {error && <p role="alert">{error}</p>}
      <PendingNotice state={command} canWrite={canWrite} onCheck={check} />
      <button onClick={() => void feed.current?.refresh()}>Atualizar itens</button>
      {(canWrite || Object.values(newDraft).some(Boolean) || command.pending) && (
        <form onSubmit={add}>
          <fieldset disabled={disabled}>
            <Fields prefix="new-item" values={newDraft} onChange={setNewDraft} />
            <p>
              Quantidade opcional, até 999999,999 e três casas decimais. Unidade e quantidade são
              independentes.
            </p>
            <button>Adicionar item</button>
          </fieldset>
        </form>
      )}
      {editor && (
        <section aria-label="Edição do item">
          <h6>Editar {editor.draft.name}</h6>
          {!current ? (
            <p role="alert">
              Item indisponível. O preenchimento pode ser descartado, mas não sobrescrito.
            </p>
          ) : changed ? (
            <section aria-label="Versão atual do item">
              <p>Este item mudou em outra sessão. Compare os dados atuais com seu preenchimento.</p>
              <p>
                {current.name} — {current.quantity} {current.unit}
              </p>
              <p>{current.notes}</p>
              <button
                disabled={disabled}
                onClick={() => {
                  setEditor({ ...editor, baseVersion: current.version });
                  setError('');
                }}
              >
                Usar versão atual após revisão
              </button>
            </section>
          ) : null}
          <form onSubmit={save}>
            <fieldset disabled={disabled}>
              <Fields
                prefix={'edit-' + editor.id}
                values={editor.draft}
                edit
                onChange={(draft) => setEditor({ ...editor, draft })}
              />
              <button disabled={!current || changed}>Salvar item</button>
              <button type="button" onClick={() => setEditor(null)}>
                Descartar rascunho
              </button>
            </fieldset>
          </form>
        </section>
      )}
      {([false, true] as const).map((purchased) => (
        <section key={String(purchased)} aria-label={purchased ? 'Comprados' : 'Pendentes'}>
          <h6>{purchased ? 'Comprados' : 'Pendentes'}</h6>
          <ul>
            {rows
              .filter((r) => r.purchased === purchased)
              .map((r) => (
                <li key={r.id}>
                  <section aria-label={'Item ' + r.name}>
                    <h6>{r.name}</h6>
                    {(r.quantity !== null || r.unit !== null) && (
                      <p>
                        {r.quantity?.replace('.', ',')} {r.unit}
                      </p>
                    )}
                    {r.notes && <p className="list-description">{r.notes}</p>}
                    {canWrite && (
                      <>
                        <button
                          disabled={disabled}
                          aria-pressed={r.purchased}
                          onClick={() => mutate(r)}
                        >
                          {r.purchased ? 'Desmarcar' : 'Marcar comprado'}: {r.name}
                        </button>
                        <button
                          disabled={disabled}
                          onClick={() =>
                            setEditor({ id: r.id, baseVersion: r.version, draft: draftOf(r) })
                          }
                        >
                          Editar {r.name}
                        </button>
                        <button disabled={disabled} onClick={() => mutate(r, true)}>
                          Remover {r.name}
                        </button>
                      </>
                    )}
                  </section>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </section>
  );
}
