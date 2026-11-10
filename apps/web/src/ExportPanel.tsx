import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ApiError } from './api';
import { requestIndividualExport } from './export-api';

export function ExportPanel({ onUnauthenticated }: { onUnauthenticated: () => void }) {
  const [opened, setOpened] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => {
    if (opened && !busy) input.current?.focus();
  }, [opened, busy]);
  useEffect(() => () => pending.current?.abort(), []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const form = event.currentTarget;
    const password = String(new FormData(form).get('password') ?? '');
    form.reset();
    setBusy(true);
    setMessage('');
    setError('');
    const controller = new AbortController();
    pending.current = controller;
    try {
      const file = await requestIndividualExport(password, controller.signal);
      if (controller.signal.aborted) return;
      const url = URL.createObjectURL(file.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.filename;
      document.body.append(link);
      try {
        link.click();
      } finally {
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      setMessage('Download iniciado.');
    } catch (reason) {
      if (controller.signal.aborted) return;
      if (reason instanceof ApiError && reason.status === 401) {
        onUnauthenticated();
        return;
      }
      setError(
        reason instanceof Error
          ? reason.message
          : 'Não foi possível gerar o arquivo. Tente novamente.',
      );
      input.current?.focus();
    } finally {
      if (!controller.signal.aborted) setBusy(false);
      pending.current = null;
    }
  }
  return (
    <section aria-label="Conta" className="connection">
      <h3>Conta</h3>
      <button className="secondary" type="button" onClick={() => setOpened(true)}>
        Exportar meus dados
      </button>
      {opened && (
        <>
          <p>
            Baixe seus dados e registros permitidos pelo acesso atual. Este arquivo não substitui um
            backup das listas compartilhadas.
          </p>
          <form
            aria-label="Exportação individual"
            aria-describedby={error ? 'export-error' : undefined}
            onSubmit={(event) => {
              void submit(event);
            }}
          >
            <label htmlFor="export-password">Senha atual para exportar</label>
            <input
              ref={input}
              id="export-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={1024}
              disabled={busy}
            />
            <button type="submit" disabled={busy}>
              {busy ? 'Gerando arquivo…' : 'Baixar JSON'}
            </button>
          </form>
          {message && (
            <p role="status" className="notice">
              {message}
            </p>
          )}
          {error && (
            <p role="alert" id="export-error" className="error">
              {error}
            </p>
          )}
        </>
      )}
    </section>
  );
}
