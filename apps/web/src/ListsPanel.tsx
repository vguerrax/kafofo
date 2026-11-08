import { prepareCommand } from './kitanda-api';
import { useConfirmation } from './use-confirmation';
import { PendingNotice } from './PendingNotice';
import type { ItemSnapshot } from '@kafofo/contracts';
import { ItemsPanel } from './ItemsPanel';
import { progressLabel } from './item-format';
import { contextApi } from './context-api';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import type { ListInfo, ListCard, ListShare, ShareCandidate } from '@kafofo/contracts';
import { kitandaApi } from './kitanda-api';
import { ApiError } from './api';
import { ListLifecyclePanel } from './ListLifecyclePanel';
export function ListsPanel({
  residenceId,
  role,
  onUnauthenticated,
}: {
  residenceId: string;
  role: string;
  onUnauthenticated: () => void;
}) {
  const [rows, setRows] = useState<ListCard[]>([]),
    [selected, setSelected] = useState(''),
    [detail, setDetail] = useState<ListInfo | null>(null),
    [shares, setShares] = useState<ListShare[]>([]),
    [candidates, setCandidates] = useState<ShareCandidate[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const [newDraft, setNewDraft] = useState({ name: '', description: '' }),
    [metadataOpen, setMetadataOpen] = useState(false);
  const blocked = useRef(new Set<string>());
  const creation = useConfirmation(failure);
  const creationLifetime = useRef(creation),
    catalogRead = useRef(0);
  useEffect(() => {
    const confirmation = creationLifetime.current;
    return () => confirmation.dispose();
  }, []);
  const [canCreate, setCanCreate] = useState(role !== 'viewer');
  const version = useRef(0),
    heading = useRef<HTMLHeadingElement>(null);
  function failure(e: unknown) {
    if (e instanceof ApiError && e.status === 401) {
      setRows([]);
      setDetail(null);
      setNewDraft({ name: '', description: '' });
      creation.reset();
      onUnauthenticated();
      return;
    }
    setError(e instanceof Error ? e.message : 'Não foi possível concluir. Tente novamente.');
    if (e instanceof ApiError && [401, 403, 404].includes(e.status)) {
      setDetail(null);
      setShares([]);
      setCandidates([]);
    }
  }
  const failureRef = useRef(failure);
  useEffect(() => {
    failureRef.current = failure;
  });
  const refresh = useCallback(async () => {
    const current = ++version.current;
    let collectionLoaded = false;
    try {
      const contexts = await contextApi.contexts();
      if (current !== version.current) return;
      const residence = contexts.residences.find((r) => r.id === residenceId);
      setCanCreate(Boolean(residence?.role && residence.role !== 'viewer'));
      if (!residence) {
        setRows([]);
        setDetail(null);
        setShares([]);
        setCandidates([]);
        setError('Você não tem acesso a esta residência.');
        return;
      }
      const lists = await kitandaApi.collection(residenceId);
      if (current !== version.current) return;
      setRows(lists.filter((r) => !blocked.current.has(r.id)));
      collectionLoaded = true;
      catalogRead.current++;
      if (!selected || blocked.current.has(selected)) {
        setDetail(null);
        setShares([]);
        setCandidates([]);
        setError('');
        return;
      }
      const list = await kitandaApi.detail(selected);
      if (current !== version.current) return;
      setDetail(list);
      if (list.canWrite) setMetadataOpen(true);
      if (!list.canManageShares) {
        setShares([]);
        setCandidates([]);
      }
      if (list.canManageShares) {
        const [cs, ss] = await Promise.all([
          kitandaApi.candidates(selected),
          kitandaApi.shares(selected),
        ]);
        if (current !== version.current) return;
        setCandidates(cs);
        setShares(ss);
      }
      setError('');
    } catch (e) {
      if (current === version.current) {
        failureRef.current(e);
        if (!collectionLoaded && e instanceof ApiError && [401, 403, 404].includes(e.status)) {
          setRows([]);
          setCanCreate(false);
        }
      }
    }
  }, [residenceId, selected, setCanCreate]);
  useEffect(() => {
    const requests = version;
    void Promise.resolve().then(refresh);
    const check = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', check);
    return () => {
      requests.current++;
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', check);
    };
  }, [refresh]);
  useEffect(() => {
    heading.current?.focus();
  }, [detail?.id]);
  async function act(operation: () => Promise<unknown>, message: string) {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await operation();
      await refresh();
      setNotice(message);
    } catch (e) {
      failure(e);
      if (e instanceof ApiError && [401, 403, 404].includes(e.status)) await refresh();
    } finally {
      setBusy(false);
    }
  }
  function submit(event: FormEvent<HTMLFormElement>, create: boolean) {
    event.preventDefault();
    const form = event.currentTarget,
      fields = new FormData(form),
      input = { name: String(fields.get('name')), description: String(fields.get('description')) };
    if (create) {
      if (!canCreate || creation.pending || creation.busy) return;
      void creation.execute(
        prepareCommand('/residences/' + residenceId + '/lists', 'POST', newDraft, false),
        async (receipt) => {
          setNewDraft({ name: '', description: '' });
          setDetail(null);
          setSelected(receipt.resourceId);
          setNotice('Lista criada. Somente você tem acesso inicialmente.');
          await refresh();
        },
      );
    } else
      void act(async () => {
        if (detail) await kitandaApi.update(detail.id, input);
      }, 'Lista salva.');
  }
  function snapshot(value: ItemSnapshot) {
    if (blocked.current.has(value.list.id)) return;
    if (!value.list.canWrite) version.current++;
    setCanCreate(value.list.canWrite);
    setDetail(value.list);
    if (value.list.canWrite) setMetadataOpen(true);
    setRows((current) =>
      current.map((r) =>
        r.id === value.list.id
          ? {
              ...r,
              ...value.list,
              totalActive: value.items.length,
              totalPurchased: value.items.filter((i) => i.purchased).length,
            }
          : r,
      ),
    );
    if (!value.list.canManageShares) {
      setShares([]);
      setCandidates([]);
    }
  }
  function loseAccess(status: number) {
    version.current++;
    if (selected) blocked.current.add(selected);
    setDetail(null);
    setSelected('');
    setMetadataOpen(false);
    setShares([]);
    setCandidates([]);
    setRows((current) => current.filter((r) => !blocked.current.has(r.id)));
    setError('Seu acesso à lista foi encerrado.');
    if (status === 401) {
      creation.reset();
      setNewDraft({ name: '', description: '' });
      setRows([]);
      onUnauthenticated();
    }
  }

  return (
    <section className="lists-panel" aria-label="Listas da residência">
      <h3>Listas da residência</h3>
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      <button disabled={busy} onClick={() => void refresh()}>
        Atualizar listas
      </button>
      <ListLifecyclePanel
        residenceId={residenceId}
        list={detail}
        onUnauthenticated={onUnauthenticated}
        onChanged={refresh}
        onRemoving={() => {
          version.current++;
          setSelected('');
          setDetail(null);
          setShares([]);
          setCandidates([]);
          setMetadataOpen(false);
        }}
      />
      <PendingNotice
        state={creation}
        canWrite={canCreate}
        onCheck={async () => {
          const before = catalogRead.current;
          await refresh();
          if (catalogRead.current === before)
            throw new Error('Atualização não confirmada. Tente novamente.');
        }}
      />
      {(canCreate || Boolean(newDraft.name || newDraft.description) || creation.pending) && (
        <form onSubmit={(e) => submit(e, true)}>
          <fieldset disabled={!canCreate || creation.busy || Boolean(creation.pending)}>
            <label htmlFor="list-create-name">Nome da nova lista</label>
            <input
              id="list-create-name"
              name="name"
              value={newDraft.name}
              onChange={(e) => setNewDraft({ ...newDraft, name: e.target.value })}
              required
              maxLength={1024}
            />
            <label htmlFor="list-create-description">Descrição da nova lista</label>
            <textarea
              id="list-create-description"
              name="description"
              value={newDraft.description}
              onChange={(e) => setNewDraft({ ...newDraft, description: e.target.value })}
              maxLength={8192}
            />
            <button disabled={busy}>Criar lista</button>
          </fieldset>
        </form>
      )}
      {rows.length === 0 && <p>Nenhuma lista acessível nesta residência.</p>}
      <ul>
        {rows.map((r) => (
          <li key={r.id}>
            <article className="list-card" aria-label={'Resumo de ' + r.name}>
              <p>Residência: {r.residenceName}</p>
              <p>{progressLabel(r.totalActive, r.totalPurchased)}</p>
              <button
                disabled={busy}
                onClick={() => {
                  setSelected(r.id);
                  setDetail(null);
                  setMetadataOpen(false);
                }}
              >
                Abrir {r.name}
              </button>
            </article>
          </li>
        ))}
      </ul>
      {detail && (
        <section aria-label="Lista aberta">
          <h4 ref={heading} tabIndex={-1}>
            {detail.name}
          </h4>
          {detail.description && <p className="list-description">{detail.description}</p>}
          {(detail.canWrite || metadataOpen) && (
            <form key={detail.id} onSubmit={(e) => submit(e, false)}>
              <fieldset disabled={!detail.canWrite}>
                <label htmlFor="list-edit-name">Nome da lista</label>
                <input
                  id="list-edit-name"
                  name="name"
                  defaultValue={detail.name}
                  required
                  maxLength={1024}
                />
                <label htmlFor="list-edit-description">Descrição da lista</label>
                <textarea
                  id="list-edit-description"
                  name="description"
                  defaultValue={detail.description ?? ''}
                  maxLength={8192}
                />
                <button disabled={busy}>Salvar lista</button>
              </fieldset>
            </form>
          )}
          <ItemsPanel
            key={'items-' + detail.id}
            listId={detail.id}
            canWrite={detail.canWrite}
            onSnapshot={snapshot}
            onBlocked={loseAccess}
            onConfirmed={refresh}
          />
          {detail.canManageShares && (
            <section aria-label="Compartilhamentos da lista">
              <h5>Compartilhar esta lista</h5>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = String(new FormData(e.currentTarget).get('target'));
                  void act(() => kitandaApi.share(detail.id, target), 'Lista compartilhada.');
                }}
              >
                <label htmlFor="list-share-target">Pessoa para compartilhar</label>
                <select id="list-share-target" name="target" required>
                  <option value="">Selecione uma pessoa</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button disabled={busy || candidates.length === 0}>Compartilhar lista</button>
              </form>
              <ul>
                {shares.map((s) => (
                  <li key={s.id}>
                    {s.name}
                    <button
                      disabled={busy}
                      onClick={() =>
                        void act(
                          () => kitandaApi.revoke(detail.id, s.residenceAccessId),
                          'Compartilhamento revogado.',
                        )
                      }
                    >
                      Revogar compartilhamento de {s.name}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </section>
      )}
    </section>
  );
}
