import { createItemService } from '../src/modules/kitanda/items.js';
import { createKitandaService } from '../src/modules/kitanda/service.js';
import { createInvitationService } from '../src/modules/platform/invitations/service.js';
import { createRecoveryService } from '../src/modules/platform/recovery/service.js';
import { purgeSecurityAudit } from '../src/modules/platform/audit/retention.js';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, expect, it } from 'vitest';
import { kitandaDatabase } from './kitanda-database.js';
import { createIdentity } from '../src/modules/platform/auth/adapter.js';
import { createTransactions } from '../src/modules/platform/auth/transaction.js';
import { createAuthService } from '../src/modules/platform/auth/service.js';
import { createContextService } from '../src/modules/platform/contexts/service.js';
import { buildApp } from '../src/app.js';
import { cookie } from './auth-fixture.js';
const baseURL = 'http://127.0.0.1:5304',
  secret = randomUUID() + randomUUID(),
  password = 'test-password';
let db: Awaited<ReturnType<typeof kitandaDatabase>>;
let items: ReturnType<typeof createItemService>;
let kitanda: ReturnType<typeof createKitandaService>;

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
  db = await kitandaDatabase();
  options = { pool: db.pool, secret, baseURL };
  auth = createAuthService(options);
  service = createContextService(options);
  items = createItemService(options);
  kitanda = createKitandaService(options);
  app = await buildApp({
    auth,
    authOrigin: baseURL,
    contexts: service,
    kitanda,
    items,
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
  const owner = await person(),
    member = await person(),
    viewer = await person(),
    outsider = await person();
  const core = await service.createCore(owner.headers, 'Casa');
  for (const u of [member, viewer])
    await db.pool.query(
      'insert into platform.core_memberships(id,"coreId","userId",role) values($1,$2,$3,\'member\')',
      [randomUUID(), core.id, u.id],
    );
  const residence = await service.createResidence(owner.headers, core.id, {
    name: 'Residência',
    responsibleUserId: owner.id,
  });
  await service.setAccess(owner.headers, residence.id, member.id, 'collaborator');
  await service.setAccess(owner.headers, residence.id, viewer.id, 'viewer');
  const access = await service.accesses(owner.headers, residence.id);
  const memberAccess = access.find((a) => a.userId === member.id)!.id,
    viewerAccess = access.find((a) => a.userId === viewer.id)!.id;
  return { owner, member, viewer, outsider, core, residence, memberAccess, viewerAccess };
}

async function listFixture() {
  const f = await fixture();
  const l = await kitanda.create(f.owner.headers, f.residence.id, { name: 'Lista' }, randomUUID());
  await kitanda.share(f.owner.headers, l.resourceId, f.memberAccess);
  return { ...f, listId: l.resourceId };
}
it('audita convites, vínculos e papéis com campos explícitos sem segredos/conteúdo', async () => {
  const { owner, member, core, residence, listId } = await listFixture();
  await items.create(owner.headers, listId, { name: 'CONTEUDO-PRIVADO' }, randomUUID());
  const invites = createInvitationService(options),
    newcomer = await person();
  const invitation = await invites.issue(owner.headers, core.id),
    token = new URL(invitation.link).hash.slice(8);
  await invites.accept(newcomer.headers, token);
  const registered = await invites.issue(owner.headers, core.id),
    registeredToken = new URL(registered.link).hash.slice(8);
  await invites.register(registeredToken, {
    username: 'inv-' + randomUUID().slice(0, 8),
    password,
  });
  await service.setMemberRole(owner.headers, core.id, newcomer.id, 'admin');
  await service.setMemberRole(owner.headers, core.id, newcomer.id, 'admin');
  await service.setAccess(owner.headers, residence.id, member.id, 'viewer');
  await service.setAccess(owner.headers, residence.id, member.id, 'viewer');
  await service.removeAccess(owner.headers, residence.id, member.id);
  await service.removeAccess(owner.headers, residence.id, member.id);
  await service.removeMember(owner.headers, core.id, newcomer.id);
  const revoked = await invites.issue(owner.headers, core.id);
  await invites.revoke(owner.headers, core.id, revoked.id);
  await invites.revoke(owner.headers, core.id, revoked.id);
  const events = (await db.pool.query('select * from platform.security_events')).rows;
  expect(new Set(events.map((e) => e.action))).toEqual(
    new Set([
      'membership.created',
      'membership.role-changed',
      'membership.revoked',
      'residence-access.created',
      'residence-access.role-changed',
      'residence-access.revoked',
      'invitation.issued',
      'invitation.accepted',
      'invitation.revoked',
    ]),
  );
  expect(events.filter((e) => e.action === 'membership.role-changed')).toHaveLength(1);
  expect(events.filter((e) => e.action === 'residence-access.role-changed')).toHaveLength(1);
  expect(events.filter((e) => e.action === 'residence-access.revoked')).toHaveLength(1);
  expect(events.filter((e) => e.action === 'invitation.revoked')).toHaveLength(1);
  expect(
    events.find((e) => e.action === 'invitation.accepted' && e.invitationId === invitation.id),
  ).toMatchObject({
    actorId: newcomer.id,
    targetId: newcomer.id,
    invitationId: invitation.id,
    coreId: core.id,
  });
  for (const secret of [
    token,
    registeredToken,
    invitation.link,
    password,
    owner.headers.get('cookie')!,
    'CONTEUDO-PRIVADO',
  ])
    expect(JSON.stringify(events)).not.toContain(secret);
  expect(events.every((e) => e.createdAt instanceof Date)).toBe(true);
});
it('falha de auditoria reverte emissão/aceitação/registro/revogação, vínculos e acessos', async () => {
  const { owner, member, core, residence } = await fixture(),
    invites = createInvitationService(options),
    newcomer = await person();
  const invitation = await invites.issue(owner.headers, core.id),
    token = new URL(invitation.link).hash.slice(8);
  await db.pool.query(
    "create or replace function platform.audit_test_fail() returns trigger language plpgsql as $$ begin raise exception 'injected'; end $$",
  );
  await db.pool.query(
    'create trigger audit_test_fail before insert on platform.security_events for each row execute function platform.audit_test_fail()',
  );
  const username = 'new-' + randomUUID().slice(0, 8);
  try {
    for (const op of [
      () => invites.issue(owner.headers, core.id),
      () => invites.accept(newcomer.headers, token),
      () => invites.register(token, { username, password }),
      () => invites.revoke(owner.headers, core.id, invitation.id),
      () => service.setAccess(owner.headers, residence.id, member.id, 'viewer'),
      () => service.removeAccess(owner.headers, residence.id, member.id),
      () => service.setMemberRole(owner.headers, core.id, member.id, 'admin'),
      () => service.removeMember(owner.headers, core.id, member.id),
    ])
      await expect(op()).rejects.toMatchObject({ status: 503 });
  } finally {
    await db.pool.query('drop trigger audit_test_fail on platform.security_events');
  }
  expect(
    (await db.pool.query('select id from platform."user" where username=$1', [username])).rows,
  ).toEqual([]);
  expect(
    (
      await db.pool.query('select "consumedAt","revokedAt" from platform.invitations where id=$1', [
        invitation.id,
      ])
    ).rows[0],
  ).toEqual({ consumedAt: null, revokedAt: null });
  expect(
    (await service.accesses(owner.headers, residence.id)).find((a) => a.userId === member.id)!.role,
  ).toBe('collaborator');
  expect(
    (await service.members(owner.headers, core.id)).find((a) => a.userId === member.id)!.role,
  ).toBe('member');
});
it('recuperação reutiliza eventos existentes com ator/alvo/canal, inclusive operador local', async () => {
  const admin = await person(),
    target = await person(),
    recovery = createRecoveryService(options);
  await db.pool.query('update platform."user" set "globalAdmin"=true where id=$1', [admin.id]);
  const result = await recovery.issue({ kind: 'admin', headers: admin.headers }, target.username),
    token = new URL(result.link).hash.slice(9);
  await recovery.complete(token, 'nova-senha-segura');
  const { execFile } = await import('node:child_process'),
    { promisify } = await import('node:util');
  const command = await promisify(execFile)(
    process.execPath,
    ['--import', 'tsx', 'src/modules/platform/recovery/operator.ts', admin.username],
    {
      env: {
        ...process.env,
        DATABASE_URL: process.env['KITANDA_TEST_DATABASE_URL']!,
        AUTH_BASE_URL: baseURL,
        AUTH_SECRET: secret,
      },
    },
  );
  const events = (await db.pool.query('select * from platform.recovery_events')).rows;
  expect(events.find((e) => e.action === 'issued' && e.channel === 'admin')).toMatchObject({
    actor: admin.id,
    target: target.id,
  });
  expect(events.find((e) => e.action === 'used')).toMatchObject({
    actor: target.id,
    target: target.id,
  });
  expect(events.find((e) => e.channel === 'operator')).toMatchObject({
    actor: expect.stringMatching(/^local-uid:/),
    target: admin.id,
  });
  for (const secret of [token, command.stdout.trim(), password, 'nova-senha-segura'])
    expect(JSON.stringify(events)).not.toContain(secret);
  expect(command.stderr).toBe('');
});
it('retenção de segurança de 90 dias é independente, limitada e retomável no expurgo da #14', async () => {
  const { owner, core, listId } = await listFixture();
  const invites = createInvitationService(options);
  await invites.issue(owner.headers, core.id);
  const recent = (
    await db.pool.query('select id from platform.security_events order by "createdAt" desc limit 1')
  ).rows[0].id;
  const before = Number(
    (await db.pool.query('select count(*) total from platform.security_events')).rows[0].total,
  );
  await db.pool.query(
    'insert into platform.security_events(id,action,"actorId","coreId","createdAt") select gen_random_uuid(),\'invitation.issued\',$1,$2,clock_timestamp()-interval \'2160 hours\' from generate_series(1,505)',
    [owner.id, core.id],
  );
  await db.pool.query(
    "insert into platform.recovery_events(id,action,actor,target,channel,\"createdAt\") values(gen_random_uuid(),'issued',$1,$1,'admin',clock_timestamp()-interval '2160 hours'),(gen_random_uuid(),'issued',$1,$1,'admin',clock_timestamp()-interval '2159 hours')",
    [owner.id],
  );
  const historyBefore = (await kitanda.history(owner.headers, listId, {})).events;
  await db.pool.query(
    "create or replace function platform.audit_purge_fail() returns trigger language plpgsql as $$ begin raise exception 'injected'; end $$",
  );
  await db.pool.query(
    'create trigger audit_purge_fail before delete on platform.recovery_events for each row execute function platform.audit_purge_fail()',
  );
  try {
    await expect(purgeSecurityAudit(db.pool)).rejects.toMatchObject({ status: 503 });
  } finally {
    await db.pool.query('drop trigger audit_purge_fail on platform.recovery_events');
  }
  expect((await db.pool.query('select id from platform.security_events')).rows).toHaveLength(
    before + 505,
  );
  const results = await Promise.all([purgeSecurityAudit(db.pool), purgeSecurityAudit(db.pool)]);
  expect(results.reduce((n, r) => n + r, 0)).toBe(506);
  expect(
    (await db.pool.query('select id from platform.security_events where id=$1', [recent])).rows,
  ).toHaveLength(1);
  expect((await db.pool.query('select id from platform.recovery_events')).rows).toHaveLength(1);
  expect((await kitanda.history(owner.headers, listId, {})).events).toEqual(historyBefore);
  await db.pool.query(
    'update platform.security_events set "createdAt"=clock_timestamp()-interval \'2160 hours\' where id=$1',
    [recent],
  );
  await kitanda.purge();
  expect(
    (await db.pool.query('select id from platform.security_events where id=$1', [recent])).rows,
  ).toEqual([]);
});
it('falha no evento de uso de recuperação reverte senha, sessões e consumo', async () => {
  const admin = await person(),
    target = await person(),
    recovery = createRecoveryService(options);
  await db.pool.query('update platform."user" set "globalAdmin"=true where id=$1', [admin.id]);
  const issued = await recovery.issue({ kind: 'admin', headers: admin.headers }, target.username),
    token = new URL(issued.link).hash.slice(9);
  await db.pool.query(
    "create or replace function platform.recovery_history_fail() returns trigger language plpgsql as $$ begin raise exception 'injected'; end $$",
  );
  await db.pool.query(
    'create trigger recovery_history_fail before insert on platform.recovery_events for each row execute function platform.recovery_history_fail()',
  );
  try {
    await expect(recovery.complete(token, 'nova-senha-segura')).rejects.toMatchObject({
      status: 503,
    });
  } finally {
    await db.pool.query('drop trigger recovery_history_fail on platform.recovery_events');
  }
  expect(await auth.getSession(target.headers)).not.toBeNull();
  expect(await recovery.preview(token)).toEqual({ valid: true });
  await expect(
    auth.login({ username: target.username, password }, new Headers(), 'rollback-recovery'),
  ).resolves.toHaveProperty('ok', true);
  expect(
    (await db.pool.query("select id from platform.recovery_events where action='used'")).rows,
  ).toEqual([]);
  await recovery.complete(token, 'nova-senha-segura');
});
