import { useEffect, useState } from 'react';
import { ApiError, getHealth, getSetupState } from './api';
import { AuthPanel } from './AuthPanel';

export function App() {
  const [attempt, setAttempt] = useState(0);
  const [connection, setConnection] = useState<'loading' | 'ok' | 'error'>('loading');
  const [setup, setSetup] = useState<{ configured: boolean } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void getHealth(controller.signal)
      .then(async () => {
        let state = null;
        try {
          state = await getSetupState();
        } catch (reason) {
          if (!(reason instanceof ApiError && reason.status === 503)) throw reason;
        }
        if (!controller.signal.aborted) {
          setConnection('ok');
          setSetup(state);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setConnection('error');
      });
    return () => controller.abort();
  }, [attempt]);

  return (
    <main>
      <span className="eyebrow">Um lugar para a vida em casa</span>
      <h1>Kafofo</h1>
      <p className="intro">Organize a casa, junto de quem faz parte dela.</p>
      {connection === 'ok' && setup ? (
        <AuthPanel initiallyConfigured={setup.configured} />
      ) : (
        <section aria-label="Conexão com o servidor" className="connection">
          <p role="status">
            {connection === 'loading' && 'Conectando…'}
            {connection === 'ok' && 'Servidor disponível.'}
            {connection === 'error' && 'Não foi possível conectar. Tente novamente.'}
          </p>
          {connection === 'error' && (
            <button
              onClick={() => {
                setConnection('loading');
                setAttempt((value) => value + 1);
              }}
            >
              Tentar novamente
            </button>
          )}
        </section>
      )}
    </main>
  );
}
