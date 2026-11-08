import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import type { ItemInfo, ItemCreate, ItemUpdate } from '@kafofo/contracts';
import { itemApi } from './kitanda-api';
import { ApiError } from './api';
import { quantityInput, progressLabel } from './item-format';
function inputFrom(form: HTMLFormElement): ItemCreate {
  const fields = new FormData(form),
    value = (key: string) => String(fields.get(key) ?? '');
  return {
    name: value('name'),
    quantity: quantityInput(value('quantity')),
    unit: value('unit') || null,
    notes: value('notes') || null,
  };
}
function ItemFields({ prefix, item }: { prefix: string; item?: ItemInfo }) {
  return (
    <>
      <label htmlFor={prefix + '-name'}>{item ? 'Nome do item' : 'Nome do novo item'}</label>
      <input
        id={prefix + '-name'}
        name="name"
        defaultValue={item?.name ?? ''}
        required
        maxLength={8192}
      />
      <label htmlFor={prefix + '-quantity'}>
        {item ? 'Quantidade do item' : 'Quantidade do novo item'}
      </label>
      <input
        id={prefix + '-quantity'}
        name="quantity"
        inputMode="decimal"
        defaultValue={item?.quantity?.replace('.', ',') ?? ''}
        maxLength={1024}
      />
      <label htmlFor={prefix + '-unit'}>{item ? 'Unidade do item' : 'Unidade do novo item'}</label>
      <input id={prefix + '-unit'} name="unit" defaultValue={item?.unit ?? ''} maxLength={8192} />
      <label htmlFor={prefix + '-notes'}>
        {item ? 'Observação do item' : 'Observação do novo item'}
      </label>
      <textarea
        id={prefix + '-notes'}
        name="notes"
        defaultValue={item?.notes ?? ''}
        maxLength={8192}
      />
    </>
  );
}
function ItemRow({
  item,
  canWrite,
  busy,
  onSave,
  onPurchased,
  onRemove,
}: {
  item: ItemInfo;
  canWrite: boolean;
  busy: boolean;
  onSave: (input: ItemUpdate) => Promise<boolean>;
  onPurchased: () => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (await onSave(inputFrom(e.currentTarget))) setEditing(false);
  }
  return (
    <section aria-label={'Item ' + item.name}>
      <h6>{item.name}</h6>
      {(item.quantity !== null || item.unit !== null) && (
        <p>
          {item.quantity?.replace('.', ',')} {item.unit}
        </p>
      )}
      {item.notes && <p className="list-description">{item.notes}</p>}
      {canWrite && (
        <>
          <button disabled={busy} aria-pressed={item.purchased} onClick={onPurchased}>
            {item.purchased ? 'Desmarcar' : 'Marcar comprado'}: {item.name}
          </button>
          <button disabled={busy} onClick={() => setEditing((v) => !v)}>
            Editar {item.name}
          </button>
          <button disabled={busy} onClick={onRemove}>
            Remover {item.name}
          </button>
          {editing && (
            <form onSubmit={(e) => void save(e)}>
              <ItemFields prefix={'edit-' + item.id} item={item} />
              <button disabled={busy}>Salvar item</button>
              <button type="button" disabled={busy} onClick={() => setEditing(false)}>
                Cancelar edição do item
              </button>
            </form>
          )}
        </>
      )}
    </section>
  );
}
export function ItemsPanel({
  listId,
  canWrite,
  onChanged,
}: {
  listId: string;
  canWrite: boolean;
  onChanged: () => Promise<void>;
}) {
  const [rows, setRows] = useState<ItemInfo[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const version = useRef(0);
  const reload = useCallback(async () => {
    const current = ++version.current;
    try {
      const data = await itemApi.collection(listId);
      if (current === version.current) {
        setRows(data);
        setError('');
      }
      return true;
    } catch (e) {
      if (current === version.current) {
        setError(e instanceof Error ? e.message : 'Não foi possível carregar os itens.');
        if (e instanceof ApiError && [401, 403, 404].includes(e.status)) setRows([]);
      }
      return false;
    }
  }, [listId]);
  useEffect(() => {
    const requests = version;
    void Promise.resolve().then(reload);
    const check = () => {
      if (document.visibilityState === 'visible') void reload();
    };
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', check);
    return () => {
      requests.current++;
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', check);
    };
  }, [reload]);
  async function act(operation: () => Promise<unknown>) {
    if (busy) return false;
    setBusy(true);
    setError('');
    try {
      await operation();
      await reload();
      await onChanged();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível confirmar o salvamento.');
      if (e instanceof ApiError && [401, 403, 404].includes(e.status)) {
        await reload();
        await onChanged();
      }
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    await act(async () => {
      await itemApi.create(listId, inputFrom(form));
      form.reset();
    });
  }
  return (
    <section aria-label="Itens da lista">
      <h5>Itens da lista</h5>
      <p>{progressLabel(rows.length, rows.filter((r) => r.purchased).length)}</p>
      {error && <p role="alert">{error}</p>}
      <button disabled={busy} onClick={() => void reload()}>
        Atualizar itens
      </button>
      {canWrite && (
        <form onSubmit={(e) => void add(e)}>
          <ItemFields prefix="new-item" />
          <p>
            Quantidade opcional, até 999999,999 e três casas decimais. Unidade e quantidade são
            independentes.
          </p>
          <button disabled={busy}>Adicionar item</button>
        </form>
      )}
      {[false, true].map((purchased) => (
        <section key={String(purchased)} aria-label={purchased ? 'Comprados' : 'Pendentes'}>
          <h6>{purchased ? 'Comprados' : 'Pendentes'}</h6>
          <ul>
            {rows
              .filter((r) => r.purchased === purchased)
              .map((r) => (
                <li key={r.id}>
                  <ItemRow
                    item={r}
                    canWrite={canWrite}
                    busy={busy}
                    onSave={(input) => act(() => itemApi.update(listId, r.id, input))}
                    onPurchased={() =>
                      void act(() => itemApi.purchased(listId, r.id, !r.purchased))
                    }
                    onRemove={() => void act(() => itemApi.remove(listId, r.id))}
                  />
                </li>
              ))}
          </ul>
        </section>
      ))}
    </section>
  );
}
