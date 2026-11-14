import { Value } from 'typebox/value';
import type { TSchema } from 'typebox';
import { RecoveryLinkSchema, RecoveryPreviewSchema } from '@kafofo/contracts';
import { ApiError } from './api';
async function request(path: string, body: unknown, schema?: TSchema) {
  const response = await fetch('/api/auth/recovery/' + path, {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    let message = 'Não foi possível concluir. Tente novamente.';
    try {
      message = ((await response.json()) as { error: { message: string } }).error.message;
    } catch {
      /* transporte */
    }
    throw new ApiError(response.status, message);
  }
  if (!schema) return null;
  const data: unknown = await response.json();
  if (!Value.Check(schema, data)) throw new Error('Resposta inválida do servidor.');
  return data;
}
export const recoveryApi = {
  issue: (username: string) =>
    request('issue', { username }, RecoveryLinkSchema) as Promise<{
      link: string;
      expiresAt: string;
    }>,
  preview: (token: string) => request('preview', { token }, RecoveryPreviewSchema),
  complete: (token: string, newPassword: string) => request('complete', { token, newPassword }),
};
export const recoveryEntry = { token: '', opened: window.history.state?.recoveryPending === true };
export function captureRecovery() {
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  if (!fragment.has('recover')) return false;
  recoveryEntry.token = fragment.get('recover') ?? '';
  recoveryEntry.opened = true;
  window.history.replaceState(
    { recoveryPending: true },
    '',
    window.location.pathname + window.location.search,
  );
  return true;
}
captureRecovery();
