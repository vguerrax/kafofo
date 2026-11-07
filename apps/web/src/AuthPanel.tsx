import { ContextsPanel } from './ContextsPanel';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { SessionResponse } from '@kafofo/contracts';
import { ApiError, changePassword, getSession, login, logout, setupAccount } from './api';

export function AuthPanel({ initiallyConfigured }: { initiallyConfigured: boolean }) {
  const [configured, setConfigured] = useState(initiallyConfigured);
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [loading, setLoading] = useState(initiallyConfigured);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, [configured, session?.user.id, loading]);
  useEffect(() => {
    let active = true;
    if (initiallyConfigured)
      void getSession()
        .then((value) => {
          if (active) setSession(value);
        })
        .catch((reason: unknown) => {
          if (active && !(reason instanceof ApiError && reason.status === 401))
            setError('Não foi possível verificar o acesso. Tente novamente.');
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    return () => {
      active = false;
    };
  }, [initiallyConfigured]);
  useEffect(() => {
    if (!session) return;
    const expire = () => {
      setSession(null);
      setMessage('Sua sessão expirou. Entre novamente.');
    };
    const timer = setTimeout(
      expire,
      Math.max(0, new Date(session.expiresAt).getTime() - Date.now()),
    );
    const check = () => {
      if (document.visibilityState === 'visible')
        void getSession()
          .then(setSession)
          .catch((reason: unknown) => {
            if (reason instanceof ApiError && reason.status === 401) expire();
          });
    };
    document.addEventListener('visibilitychange', check);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', check);
    };
  }, [session]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const value = (name: string) => String(fields.get(name) ?? '');
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (session) {
        await changePassword({
          currentPassword: value('currentPassword'),
          newPassword: value('newPassword'),
        });
        setMessage('Senha alterada. As outras sessões foram encerradas.');
        setSession(await getSession());
      } else if (configured) {
        setSession(await login({ username: value('username'), password: value('password') }));
      } else {
        await setupAccount({
          code: value('code'),
          username: value('username'),
          password: value('password'),
        });
        setConfigured(true);
        setMessage('Instalação configurada. Entre com sua conta.');
      }
      form.reset();
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 409) setConfigured(true);
      if (
        session &&
        reason instanceof ApiError &&
        (reason.status === 401 || reason.status === 429)
      ) {
        try {
          await getSession();
        } catch (check) {
          if (check instanceof ApiError && check.status === 401) setSession(null);
        }
      }
      setError(
        reason instanceof Error ? reason.message : 'Não foi possível concluir. Tente novamente.',
      );
      for (const input of form.querySelectorAll<HTMLInputElement>('input[type=password]'))
        input.value = '';
    } finally {
      setBusy(false);
    }
  }
  async function signOut() {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await logout();
      setSession(null);
      setMessage('Sessão encerrada.');
    } catch {
      setError('Não foi possível sair. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <p role="status">Verificando acesso…</p>;
  return (
    <section className="auth-panel" aria-label="Acesso ao Kafofo">
      <div className="auth-heading">
        <h2 ref={heading} tabIndex={-1}>
          {session ? 'Sua casa começa aqui.' : configured ? 'Entrar' : 'Configurar seu Kafofo'}
        </h2>
        {session && (
          <button
            className="secondary"
            disabled={busy}
            onClick={() => {
              void signOut();
            }}
          >
            Sair
          </button>
        )}
      </div>
      {session ? (
        <p>Olá, {session.user.name}. Organize seus núcleos e residências.</p>
      ) : (
        !configured && (
          <p>Use o código fornecido pelo operador do servidor para criar a primeira conta.</p>
        )
      )}
      {session && (
        <ContextsPanel userId={session.user.id} onUnauthenticated={() => setSession(null)} />
      )}
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="error" id="auth-error">
          {error}
        </p>
      )}
      <form
        key={session ? 'password' : configured ? 'login' : 'setup'}
        onSubmit={(event) => {
          void submit(event);
        }}
        aria-describedby={error ? 'auth-error' : undefined}
      >
        {session ? (
          <>
            <h3>Trocar senha</h3>
            <label htmlFor="current-password">Senha atual</label>
            <input
              id="current-password"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              maxLength={1024}
            />
            <label htmlFor="new-password">Nova senha</label>
            <input
              id="new-password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              maxLength={1024}
              aria-describedby="password-help"
            />
          </>
        ) : (
          <>
            {!configured && (
              <>
                <label htmlFor="setup-code">Código de configuração</label>
                <input
                  id="setup-code"
                  type="password"
                  name="code"
                  autoComplete="off"
                  required
                  maxLength={256}
                  spellCheck={false}
                />
              </>
            )}
            <label htmlFor="username">Usuário</label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
              maxLength={30}
              aria-describedby="username-help"
            />
            <p id="username-help" className="field-help">
              De 3 a 30 letras, números, pontos, hífens ou sublinhados.
            </p>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={configured ? 'current-password' : 'new-password'}
              required
              maxLength={1024}
              aria-describedby={!configured ? 'password-help' : undefined}
            />
          </>
        )}
        {(session || !configured) && (
          <p id="password-help" className="field-help">
            De 8 a 128 caracteres, sem espaços, tabulações ou quebras de linha.
          </p>
        )}
        <button type="submit" disabled={busy}>
          {busy ? 'Aguarde…' : session ? 'Trocar senha' : configured ? 'Entrar' : 'Configurar'}
        </button>
      </form>
    </section>
  );
}
