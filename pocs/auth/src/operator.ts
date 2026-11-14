import { config } from './config.js';
import { openDatabase } from './database/client.js';
import { createLab } from './lab.js';
import { canonicalUsername } from './policies.js';
const pool = openDatabase(process.env['POC_DATABASE_URL']);
try {
  const lab = createLab({ pool, ...config() });
  const action = process.argv[2];
  if (action === 'bootstrap-code' && process.argv.length === 3) {
    process.stdout.write(JSON.stringify({ code: await lab.issueBootstrap() }) + '\n');
  } else if (action === 'recover' && process.argv.length === 4) {
    const username = canonicalUsername(process.argv[3]!);
    const user = (await pool.query('select id from auth_poc."user" where username=$1', [username]))
      .rows[0];
    if (!user) throw new Error();
    const recovery = await lab.issueRecovery({ kind: 'operator' }, user.id);
    process.stdout.write(JSON.stringify({ link: recovery.link }) + '\n');
  } else throw new Error();
} catch {
  console.error(
    'Comando recusado. Use bootstrap-code ou recover <username-do-administrador-global>.',
  );
  process.exitCode = 1;
} finally {
  await pool.end();
}
