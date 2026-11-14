import { describe, expect, it } from 'vitest';
import { canonicalUsername, validatePassword, validateDatabaseUrl } from '../src/policies.js';

describe('contrato aprovado da identidade', () => {
  it('canoniza somente caixa ASCII e preserva pontuação', () => {
    expect(canonicalUsername('Ana._-9')).toBe('ana._-9');
  });
  it.each(['ab', 'a'.repeat(31), ' ana', 'ana ', 'a na', 'aná', 'ana@x', 'ana\n'])(
    'recusa username inválido %j',
    (value) => {
      expect(() => canonicalUsername(value)).toThrow();
    },
  );
  it.each(['abc', 'a'.repeat(30)])('aceita limite de username', (value) => {
    expect(canonicalUsername(value)).toBe(value);
  });
  it.each(['a'.repeat(7), 'a'.repeat(129), 'abcdefgh ', 'abcd\tefgh', 'abcd\nefgh', 'abcd\refgh'])(
    'recusa senha sem alterar conteúdo',
    (value) => {
      expect(() => validatePassword(value)).toThrow();
    },
  );
  it.each(['a'.repeat(8), 'a'.repeat(128), 'á🔑abcdef'])(
    'aceita senha sem composição obrigatória',
    (value) => {
      expect(() => validatePassword(value)).not.toThrow();
    },
  );
  it('exige banco separado e não repete credenciais no erro', () => {
    const url = 'postgres://poc:segredo@localhost:5432/kafofo_auth_poc';
    expect(validateDatabaseUrl(url, {})).toBe(url);
    for (const candidate of [
      undefined,
      'invalid',
      'postgres://poc:segredo@localhost/kafofo',
      url,
    ]) {
      expect(() => validateDatabaseUrl(candidate, { DATABASE_URL: url })).toThrow(
        /^Banco exclusivo/,
      );
    }
    expect(() =>
      validateDatabaseUrl(url, { TEST_DATABASE_URL: url.replace('poc:segredo', 'other:password') }),
    ).toThrow();
  });
  it('recusa também o nome de banco conhecido por outro alias de host', () => {
    expect(() =>
      validateDatabaseUrl('postgresql://poc@127.0.0.1:55405/kafofo_auth_poc', {
        DATABASE_URL: 'postgresql://other@localhost:55405/kafofo_auth_poc',
      }),
    ).toThrow(/^Banco exclusivo/);
  });
});
