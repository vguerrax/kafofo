import { useEffect, useState } from 'react';
import type { InvitationInfo } from '@kafofo/contracts';
import { invitationApi } from './invitation-api';
export function InvitationsPanel({ coreId }: { coreId: string }) {
  const [rows, setRows] = useState<InvitationInfo[]>([]),
    [link, setLink] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const refresh = () => invitationApi.list(coreId).then(setRows);
  useEffect(() => {
    let active = true;
    void invitationApi
      .list(coreId)
      .then((r) => {
        if (active) setRows(r);
      })
      .catch(() => {
        if (active) setError('Não foi possível consultar convites.');
      });
    return () => {
      active = false;
    };
  }, [coreId]);
  async function act(fn: () => Promise<unknown>) {
    setBusy(true);
    setError('');
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Tente novamente.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section aria-label="Convites do núcleo">
      <h4>Convites do núcleo</h4>
      {error && <p role="alert">{error}</p>}
      <button disabled={busy} onClick={() => void act(refresh)}>
        Atualizar convites
      </button>
      <button
        disabled={busy}
        onClick={() =>
          void act(async () => {
            setLink('');
            setLink((await invitationApi.issue(coreId)).link);
          })
        }
      >
        Emitir convite
      </button>
      {link && (
        <>
          <label htmlFor="invitation-link">Link do convite — copie agora</label>
          <input
            id="invitation-link"
            readOnly
            value={link}
            onFocus={(e) => e.currentTarget.select()}
          />
          <button
            onClick={() => {
              setLink('');
            }}
          >
            Ocultar link
          </button>
        </>
      )}
      <ul>
        {rows.map((r) => (
          <li key={r.id}>
            Convite até {new Date(r.expiresAt).toLocaleString()}:{' '}
            {
              {
                active: 'Disponível',
                expired: 'Expirado',
                revoked: 'Revogado',
                consumed: 'Utilizado',
              }[r.state]
            }
            {r.state === 'active' && (
              <button
                disabled={busy}
                onClick={() => void act(() => invitationApi.revoke(coreId, r.id))}
              >
                Revogar convite
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
