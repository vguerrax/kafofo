import { useEffect, useState, type FormEvent } from 'react';
import type { SessionResponse } from '@kafofo/contracts';
import { invitationApi, invitationEntry } from './invitation-api';
export function InvitationPanel({
  session,
  onAccepted,
}: {
  session: SessionResponse | null;
  onAccepted: (alreadyMember: boolean) => void;
}) {
  const [name, setName] = useState(''),
    [error, setError] = useState(''),
    [mode, setMode] = useState<'choices' | 'register'>('choices'),
    [busy, setBusy] = useState(false),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    if (invitationEntry.token)
      void invitationApi
        .preview(invitationEntry.token)
        .then((r) => {
          if (active) {
            setName(r.name);
            setError('');
          }
        })
        .catch((e) => {
          if (active) setError(e instanceof Error ? e.message : 'Tente novamente.');
        });
    return () => {
      active = false;
    };
  }, [attempt]);
  async function accept(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    if (busy) return;
    const form = e?.currentTarget,
      fields = form ? new FormData(form) : null;
    setBusy(true);
    setError('');
    try {
      const result = fields
        ? await invitationApi.register(
            invitationEntry.token,
            String(fields.get('username')),
            String(fields.get('password')),
          )
        : await invitationApi.accept(invitationEntry.token);
      invitationEntry.coreId = result.coreId;
      invitationEntry.token = '';
      window.history.replaceState(
        { invitationCoreId: result.coreId },
        '',
        window.location.pathname + window.location.search,
      );
      onAccepted(result.alreadyMember);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Tente novamente.');
      form?.querySelectorAll<HTMLInputElement>('input[type=password]').forEach((i) => {
        i.value = '';
      });
    } finally {
      setBusy(false);
    }
  }
  return (
    <section aria-label="Aceitar convite">
      <h2>Convite para {name || 'um núcleo'}</h2>
      {error && (
        <>
          <p role="alert">{error}</p>
          <button disabled={busy} onClick={() => setAttempt((v) => v + 1)}>
            Consultar novamente
          </button>
        </>
      )}
      {!invitationEntry.token ? (
        <p>Reabra o link original para retomar o convite.</p>
      ) : (
        name && (
          <>
            {session ? (
              <>
                <p>
                  Você está usando a conta {session.user.username}. Confirmar entrada como membro
                  deste núcleo?
                </p>
                <button disabled={busy} onClick={() => void accept()}>
                  Confirmar entrada
                </button>
              </>
            ) : (
              <>
                <p>Entre com sua conta abaixo para confirmar ou crie uma conta.</p>
                <button disabled={busy} onClick={() => setMode('register')}>
                  Criar conta por convite
                </button>
                {mode === 'register' && (
                  <form onSubmit={(e) => void accept(e)}>
                    <label htmlFor="invite-username">Novo usuário</label>
                    <input
                      id="invite-username"
                      name="username"
                      required
                      minLength={3}
                      maxLength={30}
                      autoCapitalize="none"
                      autoComplete="username"
                    />
                    <label htmlFor="invite-password">Nova senha</label>
                    <input
                      id="invite-password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      maxLength={128}
                    />
                    <p>
                      Usuário: 3–30 letras, números, pontos, hífens ou sublinhados. Senha: 8–128
                      caracteres sem espaços, tabulações ou quebras de linha.
                    </p>
                    <p>Ao cadastrar, você também aceita o convite. Depois, entre pelo login.</p>
                    <button disabled={busy}>Cadastrar e aceitar convite</button>
                  </form>
                )}
              </>
            )}
          </>
        )
      )}
    </section>
  );
}
