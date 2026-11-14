import { isIP } from 'node:net';
export interface AuthConfig {
  secret: string;
  baseURL: string;
}
export function readAuthConfig(env: NodeJS.ProcessEnv): AuthConfig | undefined {
  const secret = env['AUTH_SECRET'];
  const value = env['AUTH_BASE_URL'];
  if (!secret && !value) return undefined;
  try {
    if (!secret || secret.trim().length < 32 || !value) throw new Error();
    const url = new URL(value);
    if (url.username || url.password || url.search || url.hash || url.pathname !== '/')
      throw new Error();
    if (
      url.protocol !== 'https:' &&
      !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
    )
      throw new Error();
    return { secret, baseURL: url.origin };
  } catch {
    throw new Error(
      'Configure AUTH_SECRET (mínimo 32 caracteres) e AUTH_BASE_URL com origem HTTPS ou HTTP em loopback.',
    );
  }
}
export function readTrustedProxies(value: string | undefined): string[] {
  if (!value) return [];
  const entries = value.split(',').map((part) => part.trim());
  for (const entry of entries) {
    const [address, prefix, extra] = entry.split('/');
    const family = isIP(address ?? '');
    if (
      !family ||
      extra !== undefined ||
      (prefix !== undefined &&
        (!/^\d+$/.test(prefix) ||
          Number(prefix) <= 0 ||
          Number(prefix) > (family === 4 ? 32 : 128)))
    )
      throw new Error(
        'TRUSTED_PROXIES deve conter somente IPs/CIDRs explícitos, sem rede universal.',
      );
  }
  return entries;
}
