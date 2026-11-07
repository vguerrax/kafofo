import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, expect, it } from 'vitest';
import { contextDatabase } from './context-database.js';
import { createIdentity } from '../src/modules/platform/auth/adapter.js';
import { createTransactions } from '../src/modules/platform/auth/transaction.js';
import { createAuthService } from '../src/modules/platform/auth/service.js';
import { createContextService } from '../src/modules/platform/contexts/service.js';
import { buildApp } from '../src/app.js';
import { cookie } from './auth-fixture.js';
const baseURL = 'http://127.0.0.1:5304',
  secret = randomUUID() + randomUUID(),
  password = 'test-password';
let db: Awaited<ReturnType<typeof contextDatabase>>;
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
async function join(coreId: string, userId: string, role = 'member') {
  return (
    await db.pool.query(
      'insert into platform.core_memberships(id,"coreId","userId",role) values($1,$2,$3,$4) returning id',
      [randomUUID(), coreId, userId, role],
    )
  ).rows[0].id as string;
}
beforeAll(async () => {
  db = await contextDatabase();
  options = { pool: db.pool, secret, baseURL };
  auth = createAuthService(options);
  service = createContextService(options);
  app = await buildApp({ auth, authOrigin: baseURL, contexts: service });
});
beforeEach(async () => {
  await db.pool.query('truncate platform.cores,platform."user",platform.auth_limits cascade');
});
afterAll(async () => {
  await app?.close();
  await db?.close();
});
it('cria vínculos explícitos, nomes repetidos e residência com responsável', async () => {
  const a = await person();
  const c = await service.createCore(a.headers, ' Casa ');
  const r = await service.createResidence(a.headers, c.id, {
    name: 'Casa',
    responsibleUserId: a.id,
  });
  expect((await service.contexts(a.headers)).residences).toMatchObject([
    { id: r.id, role: 'responsible' },
  ]);
  expect((await service.createCore(a.headers, 'Casa')).id).not.toBe(c.id);
});
it('membro de núcleo não recebe residência e global sem vínculo não tem superpoder', async () => {
  const a = await person(),
    b = await person(),
    g = await person();
  const c = await service.createCore(a.headers, 'A');
  await join(c.id, b.id);
  const r = await service.createResidence(a.headers, c.id, { name: 'R', responsibleUserId: a.id });
  await db.pool.query('update platform."user" set "globalAdmin"=true where id=$1', [g.id]);
  expect((await service.contexts(b.headers)).residences).toHaveLength(0);
  for (const user of [b, g])
    await expect(service.residence(user.headers, r.id)).rejects.toMatchObject({ status: 404 });
  await expect(service.setAccess(g.headers, r.id, b.id, 'responsible')).rejects.toMatchObject({
    status: 404,
  });
});
it('matriz separa nomeação administrativa e gestão de colaboradores', async () => {
  const a = await person(),
    b = await person(),
    v = await person();
  const c = await service.createCore(a.headers, 'A');
  await join(c.id, b.id);
  await join(c.id, v.id);
  const r = await service.createResidence(a.headers, c.id, { name: 'R', responsibleUserId: b.id });
  await service.setAccess(b.headers, r.id, v.id, 'viewer');
  await expect(service.setAccess(b.headers, r.id, v.id, 'responsible')).rejects.toMatchObject({
    status: 403,
  });
  await expect(service.setAccess(b.headers, r.id, b.id, 'viewer')).rejects.toMatchObject({
    status: 403,
  });
  await expect(service.setAccess(a.headers, r.id, v.id, 'collaborator')).rejects.toMatchObject({
    status: 403,
  });
  await service.setAccess(a.headers, r.id, v.id, 'responsible');
  await service.setAccess(a.headers, r.id, v.id, 'viewer');
  await expect(service.setAccess(v.headers, r.id, b.id, 'collaborator')).rejects.toMatchObject({
    status: 403,
  });
});
it('recusa alvo de outro núcleo e FKs cruzadas', async () => {
  const a = await person(),
    b = await person();
  const c = await service.createCore(a.headers, 'A'),
    other = await service.createCore(b.headers, 'B');
  const r = await service.createResidence(a.headers, c.id, { name: 'R', responsibleUserId: a.id });
  await expect(service.setAccess(a.headers, r.id, b.id, 'responsible')).rejects.toMatchObject({
    status: 400,
  });
  const m = (
    await db.pool.query('select id from platform.core_memberships where "coreId"=$1', [other.id])
  ).rows[0].id;
  await expect(
    db.pool.query(
      'insert into platform.residence_accesses(id,"coreId","residenceId","membershipId",role) values($1,$2,$3,$4,$5)',
      [randomUUID(), c.id, r.id, m, 'viewer'],
    ),
  ).rejects.toThrow();
});
it('revoga, reconcede com ID novo e não restaura acessos por reingresso', async () => {
  const a = await person(),
    b = await person();
  const c = await service.createCore(a.headers, 'A');
  await join(c.id, b.id);
  const r = await service.createResidence(a.headers, c.id, { name: 'R', responsibleUserId: a.id });
  await service.setAccess(a.headers, r.id, b.id, 'responsible');
  const old = (await service.accesses(a.headers, r.id)).find((x) => x.userId === b.id)!.id;
  await service.removeMember(a.headers, c.id, b.id);
  await expect(service.residence(b.headers, r.id)).rejects.toMatchObject({ status: 404 });
  await join(c.id, b.id);
  expect((await service.contexts(b.headers)).residences).toHaveLength(0);
  await service.setAccess(a.headers, r.id, b.id, 'responsible');
  expect((await service.accesses(a.headers, r.id)).find((x) => x.userId === b.id)!.id).not.toBe(
    old,
  );
});
it('último administrador protegido inclusive contra rebaixamentos concorrentes', async () => {
  const a = await person(),
    b = await person();
  const c = await service.createCore(a.headers, 'A');
  await join(c.id, b.id, 'admin');
  const results = await Promise.allSettled([
    service.setMemberRole(a.headers, c.id, a.id, 'member'),
    service.setMemberRole(b.headers, c.id, b.id, 'member'),
  ]);
  expect(results.filter((x) => x.status === 'fulfilled')).toHaveLength(1);
  expect(
    (
      await db.pool.query(
        'select id from platform.core_memberships where "coreId"=$1 and role=\'admin\' and "revokedAt" is null',
        [c.id],
      )
    ).rows,
  ).toHaveLength(1);
});
it('saída mantém identidade e participações em outros núcleos', async () => {
  const a = await person(),
    b = await person();
  const c = await service.createCore(a.headers, 'A'),
    other = await service.createCore(b.headers, 'B');
  await join(c.id, b.id);
  await service.removeMember(b.headers, c.id, b.id);
  expect((await service.contexts(b.headers)).cores.map((x) => x.id)).toEqual([other.id]);
  await expect(service.removeMember(a.headers, c.id, a.id)).rejects.toMatchObject({ status: 409 });
});
it('rollback de criação não deixa residência sem responsável', async () => {
  const a = await person(),
    b = await person();
  const c = await service.createCore(a.headers, 'A');
  await expect(
    service.createResidence(a.headers, c.id, { name: 'R', responsibleUserId: b.id }),
  ).rejects.toMatchObject({ status: 400 });
  expect((await db.pool.query('select id from platform.residences')).rows).toHaveLength(0);
});
it('HTTP exige sessão, origem e corpos estritos; não vaza contextos', async () => {
  expect((await app.inject('/api/platform/contexts')).statusCode).toBe(401);
  const a = await person();
  const headers = { cookie: a.headers.get('cookie')!, origin: baseURL };
  expect(
    (
      await app.inject({
        method: 'POST',
        url: '/api/platform/cores',
        headers,
        payload: { name: 'A', globalAdmin: true },
      })
    ).statusCode,
  ).toBe(400);
  expect(
    (
      await app.inject({
        method: 'POST',
        url: '/api/platform/cores',
        headers: { cookie: headers.cookie },
        payload: { name: 'A' },
      })
    ).statusCode,
  ).toBe(403);
  expect(
    (await app.inject({ url: '/api/platform/residences/' + randomUUID(), headers })).statusCode,
  ).toBe(404);
});
it('falha de persistência reverte residência e concessão', async () => {
  const a = await person(),
    c = await service.createCore(a.headers, 'A');
  await db.pool.query(
    "create or replace function platform.context_test_fail() returns trigger language plpgsql as $$ begin raise exception 'injected'; end $$",
  );
  await db.pool.query(
    'create trigger context_test_fail before insert on platform.residence_accesses for each row execute function platform.context_test_fail()',
  );
  try {
    await expect(
      service.createResidence(a.headers, c.id, { name: 'R', responsibleUserId: a.id }),
    ).rejects.toMatchObject({ status: 503 });
  } finally {
    await db.pool.query('drop trigger context_test_fail on platform.residence_accesses');
  }
  expect((await db.pool.query('select id from platform.residences')).rows).toHaveLength(0);
});
it('operação esperando lock revalida papel após revogação administrativa', async () => {
  const a = await person(),
    b = await person(),
    c = await service.createCore(a.headers, 'A');
  await join(c.id, b.id, 'admin');
  const locker = await db.pool.connect();
  await locker.query('begin');
  await locker.query('select pg_advisory_xact_lock(hashtext($1))', ['core:' + c.id]);
  await locker.query(
    'update platform.core_memberships set role=\'member\' where "coreId"=$1 and "userId"=$2',
    [c.id, a.id],
  );
  const pending = service.createResidence(a.headers, c.id, { name: 'R', responsibleUserId: a.id });
  const assertion = expect(pending).rejects.toMatchObject({ status: 403 });
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
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    expect(waiting).toBe(true);
  } finally {
    await locker.query('commit');
    locker.release();
  }
  await assertion;
  expect((await db.pool.query('select id from platform.residences')).rows).toHaveLength(0);
});
it('revalida sessão revogada enquanto aguarda o lock da conta', async () => {
  const a = await person();
  const locker = await db.pool.connect();
  await locker.query('begin');
  await locker.query('select pg_advisory_xact_lock(hashtext($1))', ['account:' + a.username]);
  await locker.query('delete from platform.session where "userId"=$1', [a.id]);
  const assertion = expect(service.createCore(a.headers, 'Não criar')).rejects.toMatchObject({
    status: 401,
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
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    expect(waiting).toBe(true);
  } finally {
    await locker.query('commit');
    locker.release();
  }
  await assertion;
});
