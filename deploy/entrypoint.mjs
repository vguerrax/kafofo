import process from 'node:process';
import { readFileSync, openSync } from 'node:fs';
import { spawn } from 'node:child_process';

try {
  const password = readFileSync(process.env.DB_PASSWORD_FILE, 'utf8').trim();
  const secret = readFileSync(process.env.AUTH_SECRET_FILE, 'utf8').trim();
  if (password.length < 32 || secret.length < 32) throw new Error();
  process.env.DATABASE_URL = `postgresql://kafofo:${encodeURIComponent(password)}@db:5432/kafofo`;
  process.env.AUTH_SECRET = secret;
  const command = process.argv.slice(2);
  if (!command.length) throw new Error();
  // Operator commands have a private stdout; only the server goes to technical logs.
  const server = command[1] === 'dist/server.js';
  const log = server ? openSync('/logs/api/server.log', 'a', 0o600) : undefined;
  const child = spawn(command[0], command.slice(1), {
    stdio: ['inherit', log ?? 'inherit', log ?? 'inherit'],
  });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
  child.on('error', () => {
    process.stderr.write('Falha ao executar comando.\n');
    process.exitCode = 1;
  });
  child.on('exit', (code, signal) => {
    process.exitCode = code ?? (signal ? 1 : 0);
  });
} catch {
  process.stderr.write('Configuração de implantação inválida; confira segredos e comando.\n');
  process.exitCode = 1;
}
