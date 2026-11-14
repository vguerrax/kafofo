import { useEffect, useRef, useState, type FormEvent } from 'react';
import { recoveryApi, recoveryEntry } from './recovery-api';
export function RecoveryPanel({ onCompleted }: { onCompleted: () => void }) {
  const [valid, setValid] = useState(false),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [attempt, setAttempt] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  useEffect(() => {
    let active = true;
    if (recoveryEntry.token)
      void recoveryApi
        .preview(recoveryEntry.token)
        .then(() => {
          if (active) {
            setValid(true);
            setError('');
          }
        })
        .catch((e) => {
          if (active) {
            setValid(false);
            setError(e instanceof Error ? e.message : 'Tente novamente.');
          }
        });
    return () => {
      active = false;
    };
  }, [attempt]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget;
    setBusy(true);
    setError('');
    try {
      await recoveryApi.complete(recoveryEntry.token, String(new FormData(form).get('password')));
      recoveryEntry.token = '';
      recoveryEntry.opened = false;
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      onCompleted();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Tente novamente.');
      form.reset();
    } finally {
      setBusy(false);
    }
  }
  return (
    <section aria-label="Recuperar acesso">
      <h2 tabIndex={-1} ref={heading}>
        Definir nova senha
      </h2>
      {!recoveryEntry.token ? (
        <p>Reabra o link original para retomar a recuperação.</p>
      ) : (
        <>
          {error && <p role="alert">{error}</p>}
          <button disabled={busy} onClick={() => setAttempt((v) => v + 1)}>
            Verificar link novamente
          </button>
          {valid && (
            <form onSubmit={(e) => void submit(e)}>
              <label htmlFor="recovery-password">Nova senha de acesso</label>
              <input
                id="recovery-password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                maxLength={1024}
              />
              <p>
                De 8 a 128 caracteres, sem espaços, tabulações ou quebras de linha. Todas as sessões
                serão encerradas.
              </p>
              <button disabled={busy}>Definir senha e encerrar sessões</button>
            </form>
          )}
        </>
      )}
    </section>
  );
}
export function RecoveryAdminPanel() {
  const [link, setLink] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget;
    setBusy(true);
    setError('');
    setLink('');
    try {
      setLink((await recoveryApi.issue(String(new FormData(form).get('username')))).link);
      form.reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Tente novamente.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section aria-label="Emissão de recuperação">
      <h3>Recuperar outra conta</h3>
      <p>
        Verifique a identidade da pessoa antes de emitir. Entregue o link manualmente, em canal
        privado. A pessoa define sua senha; não solicite a senha dela.
      </p>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={(e) => void submit(e)}>
        <label htmlFor="recovery-target">Usuário da conta a recuperar</label>
        <input
          id="recovery-target"
          name="username"
          required
          maxLength={30}
          autoCapitalize="none"
          autoComplete="off"
        />
        <button disabled={busy}>Emitir recuperação</button>
      </form>
      {link && (
        <>
          <label htmlFor="recovery-link">Link de recuperação — copie agora</label>
          <input
            id="recovery-link"
            value={link}
            readOnly
            onFocus={(e) => e.currentTarget.select()}
          />
          <button onClick={() => setLink('')}>Ocultar link de recuperação</button>
        </>
      )}
    </section>
  );
}
