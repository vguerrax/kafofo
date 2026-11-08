import { listActions } from './kitanda-actions.js';
import { createLogger } from '../src/logger.js';
import { createKitandaService } from '../src/modules/kitanda/service.js';
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
let kitanda: ReturnType<typeof listActions>;
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
  db = await kitandaDatabase();
  options = { pool: db.pool, secret, baseURL };
  auth = createAuthService(options);
  service = createContextService(options);
  const kitandaCommands = createKitandaService({ ...options, now: () => clock });
  kitanda = listActions(kitandaCommands);
  app = await buildApp({
    logger: createLogger('info', {
      write: (line: string) => {
        logs += line;
      },
    }),
    auth,
    authOrigin: baseURL,
    contexts: service,
    kitanda: kitandaCommands,
  });
});
beforeEach(async () => {
  clock = Date.now();
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
it('lista privada, nomes repetidos e metadados normalizados', async () => {
  const { owner, member, residence } = await fixture();
  const list = await kitanda.create(owner.headers, residence.id, {
    name: '  Compras  da casa  ',
    description: '  descrição\ncom linhas  ',
  });
  expect(list).toMatchObject({
    name: 'Compras  da casa',
    description: 'descrição\ncom linhas',
    canWrite: true,
    canManageShares: true,
  });
  expect(
    (
      await kitanda.create(owner.headers, residence.id, {
        name: 'Compras  da casa',
        description: '   ',
      })
    ).description,
  ).toBeUndefined();
  expect(await kitanda.collection(member.headers, residence.id)).toHaveLength(0);
  await expect(kitanda.detail(member.headers, list.id)).rejects.toMatchObject({ status: 404 });
  await expect(kitanda.update(member.headers, list.id, { name: 'Espiar' })).rejects.toMatchObject({
    status: 404,
  });
});
it('global, administrador do núcleo e responsável não recebem acesso implícito', async () => {
  const { owner, member, outsider, core, residence } = await fixture();
  const list = await kitanda.create(member.headers, residence.id, { name: 'Privada' });
  await db.pool.query('update platform."user" set "globalAdmin"=true where id=$1', [outsider.id]);
  for (const u of [owner, outsider])
    await expect(kitanda.detail(u.headers, list.id)).rejects.toMatchObject({ status: 404 });
  await service.setMemberRole(owner.headers, core.id, member.id, 'admin');
  expect(await kitanda.collection(owner.headers, residence.id)).toHaveLength(0);
});
it('valida nome e descrição sem truncar, incluindo caracteres Unicode', async () => {
  const { owner, residence } = await fixture();
  for (const name of [' ', 'a\nb', 'a\rb', 'a'.repeat(121)])
    await expect(kitanda.create(owner.headers, residence.id, { name })).rejects.toMatchObject({
      status: 400,
    });
  await expect(
    kitanda.create(owner.headers, residence.id, { name: 'Nome', description: 'a'.repeat(2001) }),
  ).rejects.toMatchObject({ status: 400 });
  const l = await kitanda.create(owner.headers, residence.id, { name: '😀'.repeat(120) });
  await kitanda.update(owner.headers, l.id, { description: '  nova  descrição  ' });
  expect(await kitanda.detail(owner.headers, l.id)).toMatchObject({
    description: 'nova  descrição',
  });
  await kitanda.update(owner.headers, l.id, { description: '' });
  expect((await kitanda.detail(owner.headers, l.id)).description).toBeUndefined();
});
it('papel vigente limita criação/escrita/gestão, inclusive para criador', async () => {
  const { owner, viewer, residence, viewerAccess } = await fixture();
  await expect(
    kitanda.create(viewer.headers, residence.id, { name: 'Negada' }),
  ).rejects.toMatchObject({ status: 403 });
  const list = await kitanda.create(owner.headers, residence.id, { name: 'Lista' });
  await kitanda.share(owner.headers, list.id, viewerAccess);
  expect(await kitanda.detail(viewer.headers, list.id)).toMatchObject({
    canWrite: false,
    canManageShares: false,
  });
  await expect(kitanda.update(viewer.headers, list.id, { name: 'Negada' })).rejects.toMatchObject({
    status: 403,
  });
  await service.setAccess(owner.headers, residence.id, owner.id, 'viewer');
  expect(await kitanda.detail(owner.headers, list.id)).toMatchObject({
    canWrite: false,
    canManageShares: false,
  });
  await expect(kitanda.candidates(owner.headers, list.id)).rejects.toMatchObject({ status: 403 });
});
it('compartilhamento é exclusivo do criador e idempotente, com candidatos mínimos', async () => {
  const { owner, member, residence, memberAccess } = await fixture();
  const list = await kitanda.create(owner.headers, residence.id, { name: 'Lista' });
  const candidates = await kitanda.candidates(owner.headers, list.id);
  expect(candidates.find((c) => c.id === memberAccess)).toEqual({
    id: memberAccess,
    name: member.username,
  });
  await kitanda.share(owner.headers, list.id, memberAccess);
  await kitanda.share(owner.headers, list.id, memberAccess);
  expect(await kitanda.shares(owner.headers, list.id)).toHaveLength(1);
  expect(await kitanda.detail(member.headers, list.id)).toMatchObject({
    canWrite: true,
    canManageShares: false,
  });
  await kitanda.update(member.headers, list.id, { name: 'Editada' });
  for (const op of [
    () => kitanda.candidates(member.headers, list.id),
    () => kitanda.shares(member.headers, list.id),
    () => kitanda.share(member.headers, list.id, memberAccess),
  ])
    await expect(op()).rejects.toMatchObject({ status: 403 });
  await kitanda.revoke(owner.headers, list.id, memberAccess);
  await kitanda.revoke(owner.headers, list.id, memberAccess);
  await expect(kitanda.detail(member.headers, list.id)).rejects.toMatchObject({ status: 404 });
  const old = (await db.pool.query('select id from kitanda.list_shares')).rows[0].id;
  await kitanda.share(owner.headers, list.id, memberAccess);
  expect((await kitanda.shares(owner.headers, list.id))[0]!.id).not.toBe(old);
});
it('reingresso de destinatário não restaura concessão, autoria permanece', async () => {
  const { owner, member, residence, memberAccess } = await fixture();
  const list = await kitanda.create(owner.headers, residence.id, { name: 'Lista' });
  await kitanda.share(owner.headers, list.id, memberAccess);
  await service.removeAccess(owner.headers, residence.id, member.id);
  await service.setAccess(owner.headers, residence.id, member.id, 'collaborator');
  await expect(kitanda.detail(member.headers, list.id)).rejects.toMatchObject({ status: 404 });
  const newAccess = (await service.accesses(owner.headers, residence.id)).find(
    (a) => a.userId === member.id,
  )!.id;
  await kitanda.share(owner.headers, list.id, newAccess);
  await service.setAccess(owner.headers, residence.id, member.id, 'responsible');
  await service.removeAccess(owner.headers, residence.id, owner.id);
  await expect(kitanda.detail(owner.headers, list.id)).rejects.toMatchObject({ status: 404 });
  expect(await kitanda.detail(member.headers, list.id)).toMatchObject({
    name: 'Lista',
    canManageShares: false,
  });
  await service.setAccess(member.headers, residence.id, owner.id, 'viewer');
  expect(await kitanda.detail(owner.headers, list.id)).toMatchObject({
    canWrite: false,
    canManageShares: false,
  });
  await service.setAccess(owner.headers, residence.id, owner.id, 'responsible');
  expect(await kitanda.detail(owner.headers, list.id)).toMatchObject({ canManageShares: true });
});
it('integridade e API recusam vínculos cruzados sem revelar destinatários', async () => {
  const { owner, member, residence } = await fixture();
  const other = await service.createResidence(
    owner.headers,
    (await service.contexts(owner.headers)).cores[0]!.id,
    { name: 'Outra', responsibleUserId: member.id },
  );
  const otherAccess = (await service.accesses(owner.headers, other.id))[0]!.id;
  const list = await kitanda.create(owner.headers, residence.id, { name: 'Lista' });
  await expect(kitanda.share(owner.headers, list.id, otherAccess)).rejects.toMatchObject({
    status: 400,
  });
  await expect(kitanda.share(owner.headers, list.id, randomUUID())).rejects.toMatchObject({
    status: 400,
  });
  await expect(
    db.pool.query(
      'insert into kitanda.list_shares(id,"listId","residenceId","residenceAccessId") values($1,$2,$3,$4)',
      [randomUUID(), list.id, residence.id, otherAccess],
    ),
  ).rejects.toThrow();
});
it('IDs e corpos HTTP estritos, origem e superfícies futuras fechadas', async () => {
  const { owner, residence } = await fixture(),
    headers = {
      origin: baseURL,
      cookie: owner.headers.get('cookie')!,
      'idempotency-key': randomUUID(),
    };
  expect((await app.inject('/api/kitanda/residences/' + residence.id + '/lists')).statusCode).toBe(
    401,
  );
  for (const payload of [
    { name: 'Lista', creatorId: 'forged' },
    { name: 'Lista', context: 'personal' },
  ])
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/api/kitanda/residences/' + residence.id + '/lists',
          headers,
          payload,
        })
      ).statusCode,
    ).toBe(400);
  const response = await app.inject({
    method: 'POST',
    url: '/api/kitanda/residences/' + residence.id + '/lists',
    headers,
    payload: { name: 'Lista' },
  });
  expect(response.statusCode).toBe(201);
  const id = response.json().resourceId as string;
  expect(
    (await app.inject({ method: 'PATCH', url: '/api/kitanda/lists/' + id, headers, payload: {} }))
      .statusCode,
  ).toBe(400);
  expect(
    (
      await app.inject({
        method: 'PATCH',
        url: '/api/kitanda/lists/' + id,
        headers: { cookie: headers.cookie },
        payload: { name: 'Outro' },
      })
    ).statusCode,
  ).toBe(403);
  for (const suffix of ['/history', '/summary', '/trash'])
    expect(
      (await app.inject({ url: '/api/kitanda/lists/' + id + suffix, headers })).statusCode,
    ).toBe(404);
});
it('revogação de residência concluída sob lock impede compartilhamento pendente', async () => {
  const { owner, member, residence, memberAccess } = await fixture(),
    list = await kitanda.create(owner.headers, residence.id, { name: 'Lista' });
  const locker = await db.pool.connect();
  await locker.query('begin');
  await locker.query('select pg_advisory_xact_lock(hashtext($1))', ['residence:' + residence.id]);
  await locker.query('update platform.residence_accesses set "revokedAt"=now() where id=$1', [
    memberAccess,
  ]);
  const assertion = expect(
    kitanda.share(owner.headers, list.id, memberAccess),
  ).rejects.toMatchObject({ status: 400 });
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
  await expect(kitanda.detail(member.headers, list.id)).rejects.toMatchObject({ status: 404 });
});
it('operações concorrentes de compartilhamento não duplicam concessão ativa', async () => {
  const { owner, residence, memberAccess } = await fixture(),
    list = await kitanda.create(owner.headers, residence.id, { name: 'Lista' });
  await Promise.all([
    kitanda.share(owner.headers, list.id, memberAccess),
    kitanda.share(owner.headers, list.id, memberAccess),
  ]);
  expect(await kitanda.shares(owner.headers, list.id)).toHaveLength(1);
});
it('logs técnicos não incluem nome e descrição privados', async () => {
  const { owner, residence } = await fixture();
  logs = '';
  const response = await app.inject({
    method: 'POST',
    url: '/api/kitanda/residences/' + residence.id + '/lists',
    headers: {
      origin: baseURL,
      cookie: owner.headers.get('cookie')!,
      'idempotency-key': randomUUID(),
    },
    payload: { name: 'private-marker-name', description: 'private-marker-description' },
  });
  expect(response.statusCode).toBe(201);
  expect(logs).not.toContain('private-marker-name');
  expect(logs).not.toContain('private-marker-description');
});
it('isola núcleos e rebaixamento no mesmo vínculo limita ações imediatamente', async () => {
  const { owner, member, outsider, residence, memberAccess } = await fixture();
  const otherCore = await service.createCore(outsider.headers, 'Outro núcleo');
  const otherResidence = await service.createResidence(outsider.headers, otherCore.id, {
    name: 'Outra residência',
    responsibleUserId: outsider.id,
  });
  const list = await kitanda.create(owner.headers, residence.id, { name: 'Privada' });
  await expect(kitanda.collection(outsider.headers, residence.id)).rejects.toMatchObject({
    status: 404,
  });
  await expect(
    kitanda.create(owner.headers, otherResidence.id, { name: 'Inválida' }),
  ).rejects.toMatchObject({ status: 404 });
  expect(await kitanda.candidates(owner.headers, list.id)).not.toContainEqual(
    expect.objectContaining({ name: outsider.username }),
  );
  await kitanda.share(owner.headers, list.id, memberAccess);
  await service.setAccess(owner.headers, residence.id, member.id, 'viewer');
  expect(await kitanda.detail(member.headers, list.id)).toMatchObject({ canWrite: false });
  await expect(kitanda.update(member.headers, list.id, { name: 'Negada' })).rejects.toMatchObject({
    status: 403,
  });
  await service.setAccess(owner.headers, residence.id, member.id, 'collaborator');
  expect(await kitanda.detail(member.headers, list.id)).toMatchObject({ canWrite: true });
});
it('sessão revogada durante espera não concede mutação na lista', async () => {
  const { owner, residence } = await fixture(),
    list = await kitanda.create(owner.headers, residence.id, { name: 'Original' }),
    locker = await db.pool.connect();
  await locker.query('begin');
  await locker.query('select pg_advisory_xact_lock(hashtext($1))', ['account:' + owner.username]);
  await locker.query('delete from platform.session where "userId"=$1', [owner.id]);
  const assertion = expect(
    kitanda.update(owner.headers, list.id, { name: 'Indevida' }),
  ).rejects.toMatchObject({ status: 401 });
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
  expect(
    (await db.pool.query('select name from kitanda.lists where id=$1', [list.id])).rows[0].name,
  ).toBe('Original');
});
it('404 é indistinguível para lista inexistente e invisível, inclusive fora da residência', async () => {
  const { owner, member, outsider, residence } = await fixture(),
    list = await kitanda.create(owner.headers, residence.id, { name: 'Segredo' });
  for (const actor of [member, outsider]) {
    const headers = { cookie: actor.headers.get('cookie')! };
    const invisible = await app.inject({ url: '/api/kitanda/lists/' + list.id, headers });
    const missing = await app.inject({ url: '/api/kitanda/lists/' + randomUUID(), headers });
    expect(invisible.statusCode).toBe(404);
    expect(missing.statusCode).toBe(404);
    const { requestId: invisibleId, ...invisibleError } = invisible.json().error as Record<
      string,
      unknown
    >;
    const { requestId: missingId, ...missingError } = missing.json().error as Record<
      string,
      unknown
    >;
    expect(invisibleId).toBeDefined();
    expect(missingId).toBeDefined();
    expect(invisibleError).toEqual(missingError);
  }
});
