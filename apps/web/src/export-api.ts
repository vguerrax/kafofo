import { Value } from 'typebox/value';
import { IndividualExportSchema } from '@kafofo/contracts';
import { ApiError } from './api';

export async function requestIndividualExport(password: string, signal: AbortSignal) {
  const response = await fetch('/api/account/export', {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) {
    let message = 'Não foi possível gerar o arquivo. Tente novamente.';
    try {
      const data = (await response.json()) as { error?: { message?: string; code?: string } };
      message = data.error?.message ?? message;
    } catch {
      /* Falha de transporte sem corpo JSON. */
    }
    throw new ApiError(response.status, message);
  }
  const disposition = response.headers.get('content-disposition') ?? '';
  const filename = /^attachment; filename="(kafofo-dados-\d{4}-\d{2}-\d{2}\.json)"$/.exec(
    disposition,
  )?.[1];
  if (!filename || !response.headers.get('content-type')?.startsWith('application/json'))
    throw new Error('Não foi possível validar o arquivo. Tente novamente.');
  const data: unknown = await response.json();
  if (!Value.Check(IndividualExportSchema, data))
    throw new Error('Não foi possível validar o arquivo. Tente novamente.');
  return { filename, blob: new Blob([JSON.stringify(data)], { type: 'application/json' }) };
}
