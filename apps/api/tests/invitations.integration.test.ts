import { createLogger } from '../src/logger.js';
import { createInvitationService } from '../src/modules/platform/invitations/service.js';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, expect, it } from 'vitest';
import { invitationDatabase } from './invitation-database.js';
import { createIdentity } from '../src/modules/platform/auth/adapter.js';
import { createTransactions } from '../src/modules/platform/auth/transaction.js';
import { createAuthService } from '../src/modules/platform/auth/service.js';
import { createContextService } from '../src/modules/platform/contexts/service.js';
import { buildApp } from '../src/app.js';
import { cookie } from './auth-fixture.js';
const baseURL = 'http://127.0.0.1:5304',
  secret = randomUUID() + randomUUID(),
  password = 'test-password';
let db: Awaited<ReturnType<typeof invitationDatabase>>;
let invitations: ReturnType<typeof createInvitationService>;
let clock = Date.now();
let logs = '';
let service: ReturnType<typeof createContextService>;
let auth: ReturnType<typeof createAuthService>;
let app: Awaited<ReturnType<typeof buildApp>>;
let options: { pool: typeof db.pool; secret: string; baseURL: string };
async function person() {
  const username = 'u' + randomUUID().replaceAll('-', '').slice(0, 20);
  const user = await createTransactions(db.pool).run(null, (c) =>
    createIdentity(c, options, { username, password }),
  );
  const response = await auth.login({ username, password }, new Headers(), 'source' + username);
  return {
    ...user,
    headers: new Headers({
      cookie: cookie({ headers: { 'set-cookie': response.headers.getSetCookie() } }),
    }),
  };
}
beforeAll(async () => {
  db = await invitationDatabase();
  options = { pool: db.pool, secret, baseURL };
  auth = createAuthService(options);
  service = createContextService(options);
  invitations = createInvitationService({ ...options, now: () => clock });
  app = await buildApp({
    logger: createLogger('info', {
      write: (line: string) => {
        logs += line;
      },
    }),
    auth,
    authOrigin: baseURL,
    contexts: service,
    invitations,
  });
});
beforeEach(async () => {
  await db.pool.query('truncate platform.cores,platform."user",platform.auth_limits cascade');
});
afterAll(async () => {
  await app?.close();
  await db?.close();
});

async function fixture() {
  const a = await person(),
    b = await person();
  const c = await service.createCore(a.headers, 'Casa');
  const invitation = await invitations.issue(a.headers, c.id);
  return { a, b, c, token: new URL(invitation.link).hash.slice(8), invitation };
}
it('emite somente para administrador, lista sem segredo e prévia não consome', async () => {
  const { a, b, c, token } = await fixture();
  await expect(invitations.issue(b.headers, c.id)).rejects.toMatchObject({ status: 404 });
  expect(await invitations.preview(token)).toEqual({ name: 'Casa' });
  expect(JSON.stringify(await invitations.list(a.headers, c.id))).not.toContain(token);
  expect((await invitations.accept(b.headers, token)).alreadyMember).toBe(false);
  expect((await service.contexts(b.headers)).residences).toHaveLength(0);
  await expect(invitations.preview(token)).rejects.toMatchObject({ status: 404 });
});
it('participante mantém papel e convite; reingresso usa vínculo novo', async () => {
  const { a, b, c, token } = await fixture();
  expect((await invitations.accept(a.headers, token)).alreadyMember).toBe(true);
  await invitations.accept(b.headers, token);
  const old = (await service.members(a.headers, c.id)).find((x) => x.userId === b.id)!.id;
  await service.removeMember(a.headers, c.id, b.id);
  const next = await invitations.issue(a.headers, c.id);
  await invitations.accept(b.headers, new URL(next.link).hash.slice(8));
  expect((await service.members(a.headers, c.id)).find((x) => x.userId === b.id)!.id).not.toBe(old);
});
it('aceitações concorrentes consomem apenas uma entrada', async () => {
  const { b, token } = await fixture(),
    other = await person();
  const result = await Promise.allSettled([
    invitations.accept(b.headers, token),
    invitations.accept(other.headers, token),
  ]);
  expect(result.filter((x) => x.status === 'fulfilled')).toHaveLength(1);
});
it('revogação e aceitação concorrentes produzem estado consistente', async () => {
  const { a, b, c, token, invitation } = await fixture();
  await Promise.allSettled([
    invitations.revoke(a.headers, c.id, invitation.id),
    invitations.accept(b.headers, token),
  ]);
  const row = (
    await db.pool.query('select "consumedAt","revokedAt" from platform.invitations where id=$1', [
      invitation.id,
    ])
  ).rows[0];
  expect(Boolean(row.consumedAt)).not.toBe(Boolean(row.revokedAt));
});
it('expira no instante exato e revogado recebe mesmo erro', async () => {
  const { a, c, token, invitation } = await fixture();
  await invitations.revoke(a.headers, c.id, invitation.id);
  await expect(invitations.preview(token)).rejects.toMatchObject({
    status: 404,
    code: 'INVITATION_UNAVAILABLE',
  });
  const next = await invitations.issue(a.headers, c.id);
  clock += 7 * 86400000;
  await expect(invitations.preview(new URL(next.link).hash.slice(8))).rejects.toMatchObject({
    status: 404,
    code: 'INVITATION_UNAVAILABLE',
  });
  clock = Date.now();
});
it('cadastro é atômico e sem sessão; username em uso preserva convite', async () => {
  const { b, c, token } = await fixture();
  await expect(
    invitations.register(token, { username: b.username, password }),
  ).rejects.toMatchObject({ status: 409 });
  expect(await invitations.preview(token)).toEqual({ name: 'Casa' });
  const username = 'new' + randomUUID().slice(0, 8);
  expect(await invitations.register(token, { username, password })).toMatchObject({ coreId: c.id });
  const user = (await db.pool.query('select id from platform."user" where username=$1', [username]))
    .rows[0];
  expect(
    (await db.pool.query('select id from platform.session where "userId"=$1', [user.id])).rows,
  ).toHaveLength(0);
});
it('falha de persistência reverte conta, vínculo e consumo', async () => {
  const { token } = await fixture(),
    username = 'rollback';
  await db.pool.query(
    "create or replace function platform.invitation_test_fail() returns trigger language plpgsql as $$ begin raise exception 'injected'; end $$",
  );
  await db.pool.query(
    'create trigger invitation_test_fail before update on platform.invitations for each row execute function platform.invitation_test_fail()',
  );
  try {
    await expect(invitations.register(token, { username, password })).rejects.toMatchObject({
      status: 503,
    });
  } finally {
    await db.pool.query('drop trigger invitation_test_fail on platform.invitations');
  }
  expect(
    (await db.pool.query('select id from platform."user" where username=$1', [username])).rows,
  ).toHaveLength(0);
  expect(await invitations.preview(token)).toEqual({ name: 'Casa' });
});
it('HTTP protege origem, sessão e entrada estrita', async () => {
  const { token } = await fixture();
  expect(
    (
      await app.inject({
        method: 'POST',
        url: '/api/platform/invitations/preview',
        payload: { token },
      })
    ).statusCode,
  ).toBe(403);
  expect(
    (
      await app.inject({
        method: 'POST',
        url: '/api/platform/invitations/accept',
        headers: { origin: baseURL },
        payload: { token },
      })
    ).statusCode,
  ).toBe(401);
  expect(
    (
      await app.inject({
        method: 'POST',
        url: '/api/platform/invitations/register',
        headers: { origin: baseURL },
        payload: { token, username: 'valid', password, role: 'admin' },
      })
    ).statusCode,
  ).toBe(400);
});
it('limites persistem mesmo após falha e retornam Retry-After', async () => {
  const headers = { origin: baseURL };
  for (let i = 0; i < 10; i++)
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/api/platform/invitations/register',
          headers,
          payload: { token: 'invalid', username: 'valid', password },
        })
      ).statusCode,
    ).toBe(404);
  const response = await app.inject({
    method: 'POST',
    url: '/api/platform/invitations/register',
    headers,
    payload: { token: 'invalid', username: 'valid', password },
  });
  expect(response.statusCode).toBe(429);
  expect(Number(response.headers['retry-after'])).toBeGreaterThan(0);
});
it('revalida papel administrativo após espera pelo lock do núcleo', async () => {
  const { a, c } = await fixture(),
    locker = await db.pool.connect();
  await locker.query('begin');
  await locker.query('select pg_advisory_xact_lock(hashtext($1))', ['core:' + c.id]);
  await locker.query(
    'update platform.core_memberships set role=\'member\' where "coreId"=$1 and "userId"=$2',
    [c.id, a.id],
  );
  const assertion = expect(invitations.issue(a.headers, c.id)).rejects.toMatchObject({
    status: 403,
  });
  try {
    let waiting = false;
    for (let i = 0; i < 40; i++) {
      if (
        (
          await db.pool.query(
            "select count(*)::int n from pg_locks where locktype='advisory' and not granted",
          )
        ).rows[0].n
      ) {
        waiting = true;
        break;
      }
      await new Promise((r) => setTimeout(r, 10));
    }
    expect(waiting).toBe(true);
  } finally {
    await locker.query('commit');
    locker.release();
  }
  await assertion;
});

it('não expõe token ou senha em logs e erros HTTP', async () => {
  const { token } = await fixture();
  logs = '';
  const response = await app.inject({
    method: 'POST',
    url: '/api/platform/invitations/register',
    headers: { origin: baseURL },
    payload: { token, username: 'bad username', password: 'secret-password-marker' },
  });
  expect(response.statusCode).toBe(400);
  expect(logs).not.toContain(token);
  expect(logs).not.toContain('secret-password-marker');
  expect(response.body).not.toContain(token);
  expect(response.body).not.toContain('secret-password-marker');
});
