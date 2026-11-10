import { describe, expect, it } from 'vitest';
import { readConfig } from './config.js';

describe('configuração de inicialização', () => {
  it('usa loopback por padrão e mantém conexão opcional para liveness', () => {
    expect(readConfig({})).toMatchObject({
      host: '127.0.0.1',
      port: 4304,
      logLevel: 'info',
      databaseUrl: undefined,
    });
  });

  it.each(['0', '-1', '65536', '1.5', 'invalid'])('recusa PORT=%s', (port) => {
    expect(() => readConfig({ PORT: port })).toThrow('PORT');
  });

  it('recusa configuração inválida sem repetir credenciais no erro', () => {
    expect(() => readConfig({ LOG_LEVEL: 'invalid' })).toThrow('LOG_LEVEL');
    expect(() => readConfig({ DATABASE_URL: 'invalid-secret' })).toThrow(
      'URL do PostgreSQL inválida.',
    );
    expect(() => readConfig({ DATABASE_URL: 'mysql://user:secret@localhost/db' })).toThrow(
      'A conexão deve usar PostgreSQL.',
    );
  });
});
