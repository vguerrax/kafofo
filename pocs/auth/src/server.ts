import { config } from './config.js';
import { openDatabase } from './database/client.js';
import { createLab } from './lab.js';
import { buildServer } from './http.js';
const pool = openDatabase(process.env['POC_DATABASE_URL']);
const server = buildServer(createLab({ pool, ...config() }), config().baseURL);
server.addHook('onClose', async () => {
  await pool.end();
});
try {
  await server.listen({ host: '127.0.0.1', port: 4505 });
} catch {
  console.error('Falha ao iniciar laboratório. Confira banco e portas.');
  await pool.end();
  process.exitCode = 1;
}
for (const signal of ['SIGTERM', 'SIGINT'])
  process.on(signal, () => {
    void server.close();
  });
