import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { AuthConfig } from './config.js';
import { createIdentity } from './adapter.js';
import type { createTransactions } from './transaction.js';
import { AuthError } from './policies.js';

const digest = (value: string) => createHash('sha256').update(value).digest();
export function createBootstrap(
  options: AuthConfig,
  transactions: ReturnType<typeof createTransactions>,
  now: () => number = Date.now,
) {
  async function configured() {
    return transactions.run(
      null,
      async (client) =>
        (await client.query('select configured from platform.auth_setup where id=1')).rows[0]
          ?.configured === true,
    );
  }
  async function issueBootstrap() {
    return transactions.run('auth:setup', async (client) => {
      if (
        (await client.query('select configured from platform.auth_setup where id=1')).rows[0]
          ?.configured
      )
        throw new AuthError(409, 'ALREADY_CONFIGURED', 'A instalação já foi configurada.');
      const code = randomBytes(32).toString('hex');
      await client.query(
        'insert into platform.auth_setup(id,digest,"expiresAt") values(1,$1,$2) on conflict(id) do update set digest=$1,"expiresAt"=$2',
        [digest(code).toString('hex'), new Date(now() + 1800000)],
      );
      return code;
    });
  }
  async function bootstrap(code: string, input: { username: string; password: string }) {
    return transactions.run('auth:setup', async (client) => {
      const record = (await client.query('select * from platform.auth_setup where id=1')).rows[0];
      if (record?.configured)
        throw new AuthError(409, 'ALREADY_CONFIGURED', 'A instalação já foi configurada.');
      if (
        !record?.digest ||
        !record.expiresAt ||
        record.expiresAt.getTime() <= now() ||
        !timingSafeEqual(Buffer.from(record.digest, 'hex'), digest(code))
      )
        throw new AuthError(
          400,
          'INVALID_SETUP_CODE',
          'Código de configuração inválido ou expirado.',
        );
      const user = await createIdentity(client, options, input);
      await client.query('update platform."user" set "globalAdmin"=true where id=$1', [user.id]);
      await client.query(
        'update platform.auth_setup set configured=true,digest=null,"expiresAt"=null where id=1',
      );
    });
  }
  return { configured, issueBootstrap, bootstrap };
}
