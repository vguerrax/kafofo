import { openDatabase, migrate } from './client.js';
const pool = openDatabase(process.env['POC_DATABASE_URL']);
try {
  await migrate(pool);
  console.log('Migrações da POC aplicadas.');
} catch {
  console.error('Falha ao migrar banco da POC.');
  process.exitCode = 1;
} finally {
  await pool.end();
}
