export function config() {
  const secret = process.env['POC_AUTH_SECRET'];
  const baseURL = process.env['POC_ORIGIN'] ?? 'http://127.0.0.1:5505';
  if (!secret || secret.length < 32)
    throw new Error('POC_AUTH_SECRET deve ter pelo menos 32 caracteres.');
  if (!/^https?:\/\/127\.0\.0\.1:5505$/.test(baseURL))
    throw new Error('POC_ORIGIN deve usar loopback na porta 5505.');
  return { secret, baseURL };
}
