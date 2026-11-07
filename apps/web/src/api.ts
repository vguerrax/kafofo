import {
  HealthResponseSchema,
  SessionResponseSchema,
  SetupStateSchema,
  type HealthResponse,
  type LoginRequest,
  type SetupRequest,
  type PasswordRequest,
  type SessionResponse,
} from '@kafofo/contracts';
import { Value } from 'typebox/value';

export async function getHealth(signal: AbortSignal): Promise<HealthResponse> {
  const response = await fetch('/api/health', { signal });
  if (!response.ok) throw new Error('Servidor indisponível.');
  const data: unknown = await response.json();
  if (!Value.Check(HealthResponseSchema, data)) throw new Error('Resposta inválida do servidor.');
  return data;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
async function request(path: string, body?: unknown) {
  const response = await fetch('/api/auth/' + path, {
    credentials: 'same-origin',
    cache: 'no-store',
    ...(body === undefined
      ? {}
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
  });
  if (!response.ok) {
    let message = 'Não foi possível concluir. Tente novamente.';
    try {
      const result = (await response.json()) as { error?: { message?: string } };
      message = result.error?.message ?? message;
    } catch {
      /* Erro de transporte sem corpo JSON. */
    }
    throw new ApiError(response.status, message);
  }
  return response;
}
export async function getSetupState(): Promise<{ configured: boolean }> {
  const data: unknown = await (await request('setup')).json();
  if (!Value.Check(SetupStateSchema, data)) throw new Error('Resposta inválida do servidor.');
  return data;
}
export async function getSession(): Promise<SessionResponse> {
  const data: unknown = await (await request('session')).json();
  if (!Value.Check(SessionResponseSchema, data)) throw new Error('Resposta inválida do servidor.');
  return data;
}
export async function setupAccount(body: SetupRequest) {
  await request('setup', body);
}
export async function login(body: LoginRequest) {
  await request('login', body);
  return getSession();
}
export async function logout() {
  await request('logout', {});
}
export async function changePassword(body: PasswordRequest) {
  await request('password', body);
}
