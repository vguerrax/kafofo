import { useEffect, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

export function App() {
  const [message, setMessage] = useState('Entre com sua conta de laboratório.');
  const [recovery, setRecovery] = useState(
    location.hash.startsWith('#recover=') ? decodeURIComponent(location.hash.slice(9)) : '',
  );
  useEffect(() => {
    const update = () =>
      setRecovery(
        location.hash.startsWith('#recover=') ? decodeURIComponent(location.hash.slice(9)) : '',
      );
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  async function send(path: string, body: Record<string, string>) {
    const response = await fetch('/lab/' + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok)
      throw new Error('Operação recusada. Confira os dados ou aguarde para tentar novamente.');
    return response;
  }
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      await send('login', {
        username: String(data.get('username')),
        password: String(data.get('password')),
      });
      const user = (await (await fetch('/lab/me')).json()) as { username: string };
      setMessage('Sessão de ' + user.username);
      form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Falha.');
    }
  }
  async function reset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      await send('reset', {
        token: recovery,
        newPassword: String(new FormData(form).get('newPassword')),
      });
      history.replaceState(null, '', '/');
      setRecovery('');
      setMessage('Senha definida. Entre novamente.');
      form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Falha.');
    }
  }
  return (
    <main>
      <h1>Laboratório de autenticação</h1>
      <p>Experimento isolado da issue #5. Use somente contas fictícias.</p>
      <p role="status" aria-live="polite">
        {message}
      </p>
      {recovery ? (
        <form
          onSubmit={(event) => {
            void reset(event);
          }}
        >
          <label>
            Nova senha
            <input name="newPassword" type="password" autoComplete="new-password" required />
          </label>
          <button>Definir senha</button>
        </form>
      ) : (
        <form
          onSubmit={(event) => {
            void login(event);
          }}
        >
          <label>
            Usuário
            <input name="username" autoComplete="username" required />
          </label>
          <label>
            Senha
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          <button>Entrar</button>
        </form>
      )}
      <button
        onClick={() => {
          void send('logout', {})
            .then(() => setMessage('Sessão encerrada.'))
            .catch(() => setMessage('Falha ao sair.'));
        }}
      >
        Sair
      </button>
    </main>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
