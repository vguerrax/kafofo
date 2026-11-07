import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { Contexts, ResidenceInfo, MemberInfo, AccessInfo } from '@kafofo/contracts';
import { contextApi } from './context-api';
import { ApiError } from './api';
const roleLabel: Record<string, string> = {
  admin: 'Administrador',
  member: 'Membro',
  responsible: 'Responsável',
  collaborator: 'Colaborador',
  viewer: 'Visualizador',
};
export function ContextsPanel({
  userId,
  onUnauthenticated,
}: {
  userId: string;
  onUnauthenticated: () => void;
}) {
  const [data, setData] = useState<Contexts>({ cores: [], residences: [] }),
    [coreId, setCoreId] = useState(''),
    [resId, setResId] = useState('');
  const [catalogState, setCatalog] = useState<{
    coreId: string;
    source: Contexts | null;
    rows: ResidenceInfo[];
  }>({ coreId: '', source: null, rows: [] });
  const [memberState, setMembers] = useState<{
    coreId: string;
    source: Contexts | null;
    rows: MemberInfo[];
  }>({ coreId: '', source: null, rows: [] });
  const [accessState, setAccesses] = useState<{ res: ResidenceInfo | null; rows: AccessInfo[] }>({
    res: null,
    rows: [],
  });
  const catalog =
    catalogState.coreId === coreId && catalogState.source === data ? catalogState.rows : [];
  const members =
    memberState.coreId === coreId && memberState.source === data ? memberState.rows : [];
  const [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false),
    [ready, setReady] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    message: string;
    run: () => Promise<unknown>;
  } | null>(null);
  const core = data.cores.find((c) => c.id === coreId),
    res = catalog.find((r) => r.id === resId);
  const accesses = accessState.res === res ? accessState.rows : [];
  const [targetUser, setTargetUser] = useState('');
  const effectiveTarget = members.some((m) => m.userId === targetUser)
    ? targetUser
    : (members[0]?.userId ?? '');
  const targetIsResponsible = accesses.some(
    (a) => a.userId === effectiveTarget && a.role === 'responsible',
  );
  const refresh = useCallback(async () => {
    const value = await contextApi.contexts();
    setData(value);
    setCoreId((current) =>
      value.cores.some((c) => c.id === current) ? current : (value.cores[0]?.id ?? ''),
    );
    setReady(true);
  }, []);
  function failure(reason: unknown) {
    setError(
      reason instanceof ApiError ? reason.message : 'Não foi possível carregar. Tente novamente.',
    );
    if (reason instanceof ApiError && reason.status === 401) onUnauthenticated();
  }
  useEffect(() => {
    let active = true;
    void contextApi
      .contexts()
      .then((value) => {
        if (active) {
          setData(value);
          setCoreId(value.cores[0]?.id ?? '');
          setReady(true);
        }
      })
      .catch((reason) => {
        if (active) failure(reason);
      });
    return () => {
      active = false;
    };
    // O painel é remontado quando a conta muda; o callback não é estado do contexto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
  useEffect(() => {
    let active = true;
    if (!coreId) return;
    void contextApi
      .residences(coreId)
      .then((value) => {
        if (active) {
          setCatalog({ coreId, source: data, rows: value });
          setResId((current) =>
            value.some((r) => r.id === current) ? current : (value[0]?.id ?? ''),
          );
        }
      })
      .catch((reason) => {
        if (active) {
          setResId('');
          failure(reason);
          void refresh().catch(() => undefined);
        }
      });
    if (
      core?.canManageMembers ||
      data.residences.some((r) => r.coreId === coreId && r.canManageAccesses)
    )
      void contextApi
        .members(coreId)
        .then((value) => {
          if (active) setMembers({ coreId, source: data, rows: value });
        })
        .catch((reason) => {
          if (active) failure(reason);
        });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coreId, data]);
  useEffect(() => {
    let active = true;
    if (res && (res.canManageAccesses || res.canManageResponsible))
      void contextApi
        .accesses(res.id)
        .then((value) => {
          if (active) setAccesses({ res: res!, rows: value });
        })
        .catch((reason) => {
          if (active) {
            failure(reason);
            setResId('');
            void refresh().catch(() => undefined);
          }
        });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [res]);
  async function act(operation: () => Promise<unknown>, message: string) {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await operation();
      await refresh();
      setNotice(message);
    } catch (reason) {
      failure(reason);
      if (reason instanceof ApiError && (reason.status === 403 || reason.status === 404))
        await refresh().catch(() => undefined);
    } finally {
      setBusy(false);
      setConfirmation(null);
    }
  }
  function form(
    event: FormEvent<HTMLFormElement>,
    operation: (fields: FormData) => Promise<unknown>,
    message: string,
  ) {
    event.preventDefault();
    const element = event.currentTarget,
      fields = new FormData(element);
    void act(async () => {
      await operation(fields);
      element.reset();
    }, message);
  }
  return (
    <section className="contexts-panel" aria-label="Organização doméstica">
      <h3>Núcleos e residências</h3>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="notice">
          {notice}
        </p>
      )}
      <button
        disabled={busy}
        onClick={() => {
          void act(refresh, 'Contextos atualizados.');
        }}
      >
        Atualizar contextos
      </button>
      {!ready && <p>Carregando contextos…</p>}
      {ready && data.cores.length === 0 && (
        <p>Crie seu primeiro núcleo para organizar a residência.</p>
      )}
      <form
        onSubmit={(e) =>
          form(
            e,
            async (fields) => {
              const result = await contextApi.createCore(String(fields.get('name')));
              setCoreId(result.id);
            },
            'Núcleo criado. Você é administrador deste núcleo.',
          )
        }
      >
        <label htmlFor="core-name">Nome do núcleo</label>
        <input id="core-name" name="name" required maxLength={1024} />
        <button disabled={busy}>Criar núcleo</button>
      </form>
      {core && (
        <>
          <label htmlFor="core-active">Núcleo ativo</label>
          <select
            id="core-active"
            value={coreId}
            onChange={(e) => {
              setCoreId(e.target.value);
              setConfirmation(null);
            }}
          >
            {data.cores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <p>Seu papel no núcleo: {roleLabel[core.role]}</p>
          <button
            disabled={busy}
            onClick={() =>
              setConfirmation({
                message: 'Sair deste núcleo e perder os acessos às suas residências?',
                run: () => contextApi.removeMember(core.id, userId),
              })
            }
          >
            Sair do núcleo
          </button>
          {core.canCreateResidence && (
            <form
              onSubmit={(e) =>
                form(
                  e,
                  (fields) =>
                    contextApi.createResidence(
                      core.id,
                      String(fields.get('name')),
                      String(fields.get('responsibleUserId')),
                    ),
                  'Residência criada com responsável explícito.',
                )
              }
            >
              <label htmlFor="res-name">Nome da residência</label>
              <input id="res-name" name="name" required maxLength={1024} />
              <label htmlFor="res-owner">Responsável inicial</label>
              <select id="res-owner" name="responsibleUserId" required defaultValue={userId}>
                {members.map((m) => (
                  <option key={m.id} value={m.userId}>
                    {m.name}
                  </option>
                ))}
              </select>
              <button disabled={busy || !members.length}>Criar residência</button>
            </form>
          )}
          {catalog.length > 0 && (
            <>
              <label htmlFor="res-active">Residência ativa</label>
              <select
                id="res-active"
                value={resId}
                onChange={(e) => {
                  setResId(e.target.value);
                  setConfirmation(null);
                }}
              >
                {catalog.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                    {r.role ? '' : ' (administração)'}
                  </option>
                ))}
              </select>
            </>
          )}
          {res && (
            <>
              <p>
                Seu papel na residência:{' '}
                <span>{res.role ? roleLabel[res.role] : 'sem acesso ao conteúdo'}</span>
              </p>
              {(res.canManageAccesses || res.canManageResponsible) && (
                <>
                  <h4>Acessos à residência</h4>
                  <ul>
                    {accesses.map((a) => (
                      <li key={a.id}>
                        {a.name}: {roleLabel[a.role]}
                        {(a.role === 'responsible'
                          ? res.canManageResponsible
                          : res.canManageAccesses) && (
                          <button
                            disabled={busy}
                            onClick={() =>
                              setConfirmation({
                                message: 'Revogar o acesso de ' + a.name + '?',
                                run: () => contextApi.removeAccess(res.id, a.userId),
                              })
                            }
                          >
                            Revogar acesso de {a.name}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  <form
                    onSubmit={(e) =>
                      form(
                        e,
                        (fields) =>
                          contextApi.setAccess(
                            res.id,
                            String(fields.get('userId')),
                            String(fields.get('role')),
                          ),
                        'Papel da residência atualizado.',
                      )
                    }
                  >
                    <label htmlFor="access-user">Membro para acesso</label>
                    <select
                      id="access-user"
                      name="userId"
                      value={effectiveTarget}
                      onChange={(e) => setTargetUser(e.target.value)}
                      required
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.userId}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="access-role">Papel na residência</label>
                    <select id="access-role" name="role">
                      {res.canManageResponsible && <option value="responsible">Responsável</option>}
                      {(res.canManageAccesses ||
                        (res.canManageResponsible && targetIsResponsible)) && (
                        <>
                          <option value="collaborator">Colaborador</option>
                          <option value="viewer">Visualizador</option>
                        </>
                      )}
                    </select>
                    <button disabled={busy || (targetIsResponsible && !res.canManageResponsible)}>
                      Aplicar papel na residência
                    </button>
                  </form>
                </>
              )}
            </>
          )}
          {core.canManageMembers && (
            <>
              <h4>Membros do núcleo</h4>
              <ul>
                {members.map((m) => (
                  <li key={m.id}>
                    {m.name}: {roleLabel[m.role]}
                    <button
                      disabled={busy}
                      onClick={() =>
                        setConfirmation({
                          message: 'Alterar o papel de ' + m.name + ' no núcleo?',
                          run: () =>
                            contextApi.setMember(
                              core.id,
                              m.userId,
                              m.role === 'admin' ? 'member' : 'admin',
                            ),
                        })
                      }
                    >
                      {m.role === 'admin' ? 'Tornar membro' : 'Tornar administrador'}: {m.name}
                    </button>
                    <button
                      disabled={busy}
                      onClick={() =>
                        setConfirmation({
                          message: 'Remover ' + m.name + ' do núcleo e revogar seus acessos?',
                          run: () => contextApi.removeMember(core.id, m.userId),
                        })
                      }
                    >
                      Remover {m.name}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
      {confirmation && (
        <section role="dialog" aria-modal="false" aria-label="Confirmar alteração">
          <p>{confirmation.message}</p>
          <button
            autoFocus
            disabled={busy}
            onClick={() => {
              void act(confirmation.run, 'Alteração concluída.');
            }}
          >
            Confirmar
          </button>
          <button disabled={busy} onClick={() => setConfirmation(null)}>
            Cancelar
          </button>
        </section>
      )}
    </section>
  );
}
