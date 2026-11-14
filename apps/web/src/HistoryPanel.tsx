import { useEffect, useRef, useState } from 'react';
import type { HistoryAction, HistoryPage } from '@kafofo/contracts';
import { kitandaApi } from './kitanda-api';
import { createItemFeed } from './item-feed';
const labels: Record<HistoryAction, string> = {
  'list.created': 'Lista criada',
  'list.updated': 'Lista editada',
  'list.removed': 'Lista excluída',
  'list.restored': 'Lista restaurada',
  'share.granted': 'Lista compartilhada',
  'share.revoked': 'Compartilhamento revogado',
  'item.created': 'Item adicionado',
  'item.updated': 'Item editado',
  'item.purchased': 'Item marcado como comprado',
  'item.unpurchased': 'Item desmarcado',
  'item.removed': 'Item removido',
  'items.cleared': 'Comprados removidos',
};
const fields: Record<string, string> = {
  name: 'Nome',
  description: 'Descrição',
  quantity: 'Quantidade',
  unit: 'Unidade',
  notes: 'Observação',
  purchased: 'Comprado',
  deleted: 'Removido',
};
const display = (value: unknown) =>
  value === null ? 'Ausente' : typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : String(value);
function Differences({ values }: { values: object }) {
  return (
    <dl>
      {Object.entries(values).map(([key, value]) => {
        const change = value as { before: unknown; after: unknown };
        return (
          <div key={key}>
            <dt>{fields[key]}</dt>
            <dd>
              Antes: {display(change.before)}; depois: {display(change.after)}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
export function HistoryPanel({
  listId,
  name,
  onBlocked,
}: {
  listId: string;
  name: string;
  onBlocked: (status: number) => void;
}) {
  const [page, setPage] = useState<HistoryPage | null>(null),
    [cursor, setCursor] = useState<string | null>(null),
    [error, setError] = useState('');
  const callback = useRef(onBlocked),
    heading = useRef<HTMLHeadingElement>(null),
    feed = useRef<ReturnType<typeof createItemFeed<HistoryPage>> | null>(null);
  useEffect(() => {
    callback.current = onBlocked;
  }, [onBlocked]);
  useEffect(() => {
    const controller = createItemFeed({
      load: () => kitandaApi.history(listId, cursor),
      visible: () => document.visibilityState === 'visible',
      onValue: (value) => {
        setPage(value);
        setError('');
      },
      onError: () =>
        setError('Não foi possível atualizar o histórico. Os dados podem estar desatualizados.'),
      onBlocked: (status) => {
        setPage(null);
        setError('Histórico indisponível.');
        callback.current(status);
      },
    });
    feed.current = controller;
    controller.start();
    const visible = () => void controller.visibilityChanged();
    window.addEventListener('focus', visible);
    document.addEventListener('visibilitychange', visible);
    return () => {
      controller.stop();
      window.removeEventListener('focus', visible);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [listId, cursor]);
  function navigate(next: string | null) {
    heading.current?.focus();
    feed.current?.stop();
    setPage(null);
    setError('');
    setCursor(next);
  }
  return (
    <section aria-label="Histórico da lista">
      <h5 ref={heading} tabIndex={-1}>
        Histórico de {name}
      </h5>
      {error && <p role="alert">{error}</p>}
      <button onClick={() => void feed.current?.refresh()}>Atualizar histórico</button>
      {cursor && <button onClick={() => navigate(null)}>Mais recentes</button>}
      {!page && !error && <p role="status">Carregando histórico…</p>}
      {page?.events.length === 0 && <p>Nenhum evento registrado.</p>}
      <ol>
        {page?.events.map((event) => (
          <li key={event.id}>
            <article aria-label={labels[event.action]}>
              <h6>{labels[event.action]}</h6>
              <p>
                {event.actor.name} ·{' '}
                <time dateTime={event.occurredAt}>
                  {new Date(event.occurredAt).toLocaleString('pt-BR')}
                </time>
              </p>
              {event.details.participant && <p>Pessoa: {event.details.participant.name}</p>}
              {event.details.changes && <Differences values={event.details.changes} />}
              <ul>
                {event.targets.map((target) => (
                  <li key={target.itemId}>
                    {target.details ? (
                      <>
                        <p>{target.details.name}</p>
                        <Differences values={target.details.changes} />
                      </>
                    ) : (
                      <p>Conteúdo do item fora do prazo de retenção.</p>
                    )}
                  </li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ol>
      {page?.nextCursor && <button onClick={() => navigate(page.nextCursor)}>Mais antigos</button>}
    </section>
  );
}
export function ListHistoryToggle(props: {
  listId: string;
  name: string;
  onBlocked: (status: number) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(!open)}>
        {open ? 'Fechar histórico da lista' : 'Abrir histórico da lista'}
      </button>
      {open && <HistoryPanel {...props} />}
    </>
  );
}
