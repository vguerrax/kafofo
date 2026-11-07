import { describe, expect, it } from 'vitest';
import { canonicalUsername, validatePassword } from './policies.js';
import { readAuthConfig, readTrustedProxies } from './config.js';

describe('identidade e configuração de autenticação', () => {
  it.each(['abc', 'A._-9', 'a'.repeat(30)])('canoniza %s sem alterar o identificador', (name) => {
    expect(canonicalUsername(name)).toBe(name.toLowerCase());
  });
  it.each(['ab', 'a'.repeat(31), ' ana', 'ana ', 'aná', 'an\na', 'ana@home'])(
    'recusa username %s',
    (name) => {
      expect(() => canonicalUsername(name)).toThrow();
    },
  );
  it.each(['a'.repeat(8), 'a'.repeat(128), '😀'.repeat(4)])(
    'aceita senha nos limites',
    (password) => {
      expect(() => validatePassword(password)).not.toThrow();
    },
  );
  it.each([
    'a'.repeat(7),
    'a'.repeat(129),
    'password ',
    'pass\tword',
    'pass\nword',
    'pass\u00a0word',
  ])('recusa senha sem truncar ou remover whitespace', (password) => {
    expect(() => validatePassword(password)).toThrow();
  });
  it('permite health sem auth mas recusa configuração parcial ou insegura', () => {
    expect(readAuthConfig({})).toBeUndefined();
    for (const env of [
      { AUTH_SECRET: 's'.repeat(32) },
      { AUTH_BASE_URL: 'http://127.0.0.1:5304' },
      { AUTH_SECRET: 'short', AUTH_BASE_URL: 'https://home.invalid' },
      { AUTH_SECRET: 's'.repeat(32), AUTH_BASE_URL: 'http://home.invalid' },
      { AUTH_SECRET: 's'.repeat(32), AUTH_BASE_URL: 'https://user:secret@home.invalid/path' },
    ])
      expect(() => readAuthConfig(env)).toThrow();
    expect(
      readAuthConfig({ AUTH_SECRET: 's'.repeat(32), AUTH_BASE_URL: 'https://home.invalid' })
        ?.baseURL,
    ).toBe('https://home.invalid');
  });
  it('só permite IPs/CIDRs explícitos de proxy', () => {
    expect(readTrustedProxies(undefined)).toEqual([]);
    expect(readTrustedProxies('127.0.0.1,::1/128')).toEqual(['127.0.0.1', '::1/128']);
    for (const value of ['true', '*', '1', 'loopback', '0.0.0.0/0', '::/0', '127.0.0.1/33'])
      expect(() => readTrustedProxies(value)).toThrow();
  });
});
