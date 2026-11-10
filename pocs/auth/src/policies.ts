export class LabError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
  ) {
    super(code);
  }
}
export function canonicalUsername(value: string) {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9._-]{3,30}$/.test(value))
    throw new LabError(400, 'INVALID_USERNAME');
  return value.toLowerCase();
}
export function validatePassword(value: string) {
  if (typeof value !== 'string' || value.length < 8 || value.length > 128 || /\s/u.test(value))
    throw new LabError(400, 'INVALID_PASSWORD');
}
function databaseIdentity(value: string) {
  const url = new URL(value);
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error();
  // Conservatively reject a known database name even through another host/port alias.
  return decodeURIComponent(url.pathname);
}
export function validateDatabaseUrl(
  value: string | undefined,
  env: Record<string, string | undefined> = process.env,
) {
  try {
    if (!value || !decodeURIComponent(new URL(value).pathname).endsWith('_auth_poc'))
      throw new Error();
    const identity = databaseIdentity(value);
    for (const other of [env['DATABASE_URL'], env['TEST_DATABASE_URL']])
      if (other && databaseIdentity(other) === identity) throw new Error();
    return value;
  } catch {
    throw new Error('Banco exclusivo da POC obrigatório (nome terminado em _auth_poc).');
  }
}
