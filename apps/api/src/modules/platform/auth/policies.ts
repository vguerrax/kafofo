export class AuthError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly retryAfter?: number,
  ) {
    super(message);
  }
}
export function canonicalUsername(value: string): string {
  if (!/^[A-Za-z0-9._-]{3,30}$/.test(value))
    throw new AuthError(
      400,
      'INVALID_USERNAME',
      'Use de 3 a 30 letras, números, pontos, hífens ou sublinhados no usuário.',
    );
  return value.toLowerCase();
}
export function validatePassword(value: string): void {
  if (value.length < 8 || value.length > 128 || /\s/u.test(value))
    throw new AuthError(
      400,
      'INVALID_PASSWORD',
      'A senha deve ter de 8 a 128 caracteres, sem espaços, tabulações ou quebras de linha.',
    );
}
export const unavailable = () =>
  new AuthError(503, 'AUTH_UNAVAILABLE', 'Autenticação indisponível. Tente novamente.');
export const unauthenticated = () => new AuthError(401, 'UNAUTHENTICATED', 'Entre para continuar.');
export const limited = (seconds: number) =>
  new AuthError(
    429,
    'TRY_LATER',
    'Aguarde antes de tentar novamente.',
    Math.max(1, Math.ceil(seconds)),
  );
