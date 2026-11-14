import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import { Value } from 'typebox/value';
import { IndividualExportSchema, type IndividualExport } from '@kafofo/contracts';
import { buildApp } from '../src/app.js';
import { kitandaDatabase } from './kitanda-database.js';
import { cookie } from './auth-fixture.js';
import { createIdentity } from '../src/modules/platform/auth/adapter.js';
import { createTransactions } from '../src/modules/platform/auth/transaction.js';
import { createAuthService } from '../src/modules/platform/auth/service.js';
import { createContextService } from '../src/modules/platform/contexts/service.js';
import { createRecoveryService } from '../src/modules/platform/recovery/service.js';
import { createIndividualExportService } from '../src/modules/platform/export/service.js';
import { createKitandaService } from '../src/modules/kitanda/service.js';
import { createItemService } from '../src/modules/kitanda/items.js';
import { exportOwnActions } from '../src/modules/kitanda/public.js';

const baseURL = 'http://127.0.0.1:5304';
const password = 'export-test-password';
const secret = randomUUID() + randomUUID();
let db: Awaited<ReturnType<typeof kitandaDatabase>>;
let auth: ReturnType<typeof createAuthService>;
let contexts: ReturnType<typeof createContextService>;
let kitanda: ReturnType<typeof createKitandaService>;
let items: ReturnType<typeof createItemService>;
let app: Awaited<ReturnType<typeof buildApp>>;
let options: { pool: typeof db.pool; secret: string; baseURL: string };
let time: number;

beforeAll(async () => {
  db = await kitandaDatabase();
  options = { pool: db.pool, secret, baseURL };
  auth = createAuthService({ ...options, now: () => time });
  contexts = createContextService(options);
  kitanda = createKitandaService(options);
  items = createItemService(options);
  app = await buildApp({
    auth,
    authOrigin: baseURL,
    individualExport: createIndividualExportService({
      ...options,
      auth,
      readKitandaActions: exportOwnActions,
    }),
  });
});
beforeEach(async () => {
  time = Date.now();
  await db.pool.query('truncate platform.cores,platform."user",platform.auth_limits cascade');
});
afterEach(() => vi.restoreAllMocks());
afterAll(async () => {
  await app?.close();
  await db?.close();
});

async function person(username = 'export-owner', globalAdmin = false) {
  const user = await createTransactions(db.pool).run(null, (c) =>
    createIdentity(c, options, { username, password }),
  );
  await db.pool.query('update platform."user" set "globalAdmin"=$2 where id=$1', [
    user.id,
    globalAdmin,
  ]);
  const response = await auth.login({ username, password }, new Headers(), username);
  const headers = new Headers({
    cookie: cookie({ headers: { 'set-cookie': response.headers.getSetCookie() } }),
  });
  return { ...user, headers };
}
async function download(
  headers: Headers,
  payload: Record<string, unknown> = { password },
  url = '/api/account/export',
) {
  return app.inject({
    method: 'POST',
    url,
    headers: { cookie: headers.get('cookie') ?? '', origin: baseURL },
    payload,
  });
}
async function fixture() {
  const owner = await person(),
    other = await person('other-secret-person', true);
  const core = await contexts.createCore(owner.headers, 'Núcleo próprio');
  const residence = await contexts.createResidence(owner.headers, core.id, {
    name: 'Casa própria',
    responsibleUserId: owner.id,
  });
  await db.pool.query(
    'insert into platform.core_memberships(id,"coreId","userId",role) values($1,$2,$3,\'member\')',
    [randomUUID(), core.id, other.id],
  );
  await contexts.setAccess(owner.headers, residence.id, other.id, 'collaborator');
  const accesses = await contexts.accesses(owner.headers, residence.id);
  const ownAccess = accesses.find((a) => a.userId === owner.id)!.id;
  const otherAccess = accesses.find((a) => a.userId === other.id)!.id;
  const ownList = (
    await kitanda.create(
      owner.headers,
      residence.id,
      { name: 'Conteúdo privado da lista' },
      randomUUID(),
    )
  ).resourceId;
  await kitanda.share(owner.headers, ownList, otherAccess);
  const ownItem = (
    await items.create(
      owner.headers,
      ownList,
      { name: 'Conteúdo privado do item', quantity: '12.5', notes: 'Segredo da observação' },
      randomUUID(),
    )
  ).resourceId;
  await items.create(other.headers, ownList, { name: 'Item de terceiro' }, randomUUID());
  const privateList = (
    await kitanda.create(other.headers, residence.id, { name: 'Outra lista secreta' }, randomUUID())
  ).resourceId;
  await kitanda.share(other.headers, privateList, ownAccess);
  await items.create(
    owner.headers,
    privateList,
    { name: 'Autoria não concede acesso' },
    randomUUID(),
  );
  await kitanda.revoke(other.headers, privateList, ownAccess);
  await createRecoveryService(options).issue(
    { kind: 'admin', headers: other.headers },
    owner.username,
  );
  const otherCore = await contexts.createCore(other.headers, 'Núcleo alheio secreto');
  return {
    owner,
    other,
    core,
    residence,
    ownAccess,
    otherAccess,
    ownList,
    ownItem,
    privateList,
    otherCore,
  };
}

it('entrega JSON v1 projetado e privado para cada conta, com anexo e sem cache', async () => {
  const f = await fixture();
  const response = await download(f.owner.headers);
  expect(response.statusCode).toBe(200);
  expect(response.headers['content-type']).toMatch(/^application\/json/);
  expect(response.headers['content-disposition']).toMatch(
    /^attachment; filename="kafofo-dados-\d{4}-\d{2}-\d{2}\.json"$/,
  );
  expect(response.headers['cache-control']).toBe('no-store');
  const data = response.json<IndividualExport>();
  expect(Value.Check(IndividualExportSchema, data)).toBe(true);
  expect(Object.keys(data).sort()).toEqual([
    'generatedAt',
    'kitandaActions',
    'memberships',
    'profile',
    'schemaVersion',
    'securityEvents',
  ]);
  expect(data.profile).toEqual({
    username: f.owner.username,
    name: f.owner.username,
    createdAt: expect.stringMatching(/Z$/),
  });
  expect(data.memberships).toEqual(
    expect.arrayContaining([
      { type: 'core', id: f.core.id, name: 'Núcleo próprio', role: 'admin' },
      { type: 'residence', id: f.residence.id, name: 'Casa própria', role: 'responsible' },
    ]),
  );
  expect(data.memberships).toHaveLength(2);
  expect(data.securityEvents).toEqual(
    expect.arrayContaining([
      { type: 'recovery.issued', occurredAt: expect.stringMatching(/Z$/), channel: 'admin' },
    ]),
  );
  expect(data.kitandaActions.some((a) => a.listId === f.ownList && a.type === 'item.created')).toBe(
    true,
  );
  expect(data.kitandaActions.every((a) => a.listId === f.ownList)).toBe(true);
  expect(data.kitandaActions.map((a) => a.type)).toEqual([
    'list.created',
    'share.granted',
    'item.created',
  ]);
  const sourceSecrets = (
    await db.pool.query('select password from platform.account where "userId"=$1', [f.owner.id])
  ).rows.map((r) => r.password as string);
  const tokens = (await db.pool.query('select token from platform.session')).rows.map(
    (r) => r.token as string,
  );
  for (const value of [
    f.owner.id,
    f.other.id,
    f.other.username,
    f.privateList,
    f.otherCore.id,
    f.ownItem,
    secret,
    password,
    'Conteúdo privado',
    'Segredo da observação',
    'Item de terceiro',
    ...sourceSecrets,
    ...tokens,
  ])
    expect(response.body.includes(value)).toBe(false);
  const other = (await download(f.other.headers)).json<IndividualExport>();
  expect(other.profile.username).toBe(f.other.username);
  expect(other.kitandaActions.filter((a) => a.listId === f.ownList).map((a) => a.type)).toEqual([
    'item.created',
  ]);
  expect(
    other.kitandaActions.every((a) => a.type !== 'list.created' || a.listId !== f.ownList),
  ).toBe(true);
  expect(other.securityEvents.some((e) => e.type === 'recovery.issued')).toBe(false);
});

it('mantém objetos/listas vazios e filtra vínculos inativos', async () => {
  const owner = await person();
  expect((await download(owner.headers)).json()).toMatchObject({
    profile: { username: owner.username },
    memberships: [],
    securityEvents: [],
    kitandaActions: [],
  });
  await fixtureForRevoked(owner);
  const data = (await download(owner.headers)).json<IndividualExport>();
  expect(data.memberships).toEqual([]);
  expect(data.kitandaActions).toEqual([]);
});
async function fixtureForRevoked(owner: Awaited<ReturnType<typeof person>>) {
  const core = await contexts.createCore(owner.headers, 'Revogado');
  const residence = await contexts.createResidence(owner.headers, core.id, {
    name: 'Revogada',
    responsibleUserId: owner.id,
  });
  await kitanda.create(owner.headers, residence.id, { name: 'Revogada' }, randomUUID());
  await db.pool.query(
    'update platform.core_memberships set "revokedAt"=clock_timestamp() where "userId"=$1',
    [owner.id],
  );
}

it('recusa sessão ausente, expirada/revogada e tentativa de escolher outra conta', async () => {
  expect((await download(new Headers())).statusCode).toBe(401);
  const owner = await person();
  for (const body of [
    { password, userId: 'another-account' },
    { password, username: 'another-account' },
    { password: 42 },
    {},
  ])
    expect((await download(owner.headers, body)).statusCode).toBe(400);
  expect(
    (await download(owner.headers, { password }, '/api/account/export?userId=another')).statusCode,
  ).toBe(400);
  expect((await app.inject('/api/account/export')).statusCode).toBe(404);
  const untrusted = await app.inject({
    method: 'POST',
    url: '/api/account/export',
    headers: { cookie: owner.headers.get('cookie')!, origin: 'https://forged.example' },
    payload: { password },
  });
  expect(untrusted.statusCode).toBe(403);
  await db.pool.query(
    'update platform.session set "expiresAt"=clock_timestamp()-interval \'1 second\' where "userId"=$1',
    [owner.id],
  );
  expect((await download(owner.headers)).statusCode).toBe(401);
  await db.pool.query('delete from platform.session where "userId"=$1', [owner.id]);
  expect((await download(owner.headers)).statusCode).toBe(401);
});

it('limita falhas de senha independentemente do login, sem revogar sessões', async () => {
  const owner = await person();
  for (let i = 0; i < 4; i++) {
    const response = await download(owner.headers, { password: 'wrong-password' });
    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('INVALID_CURRENT_PASSWORD');
    expect(response.headers['content-disposition']).toBeUndefined();
  }
  const blocked = await download(owner.headers, { password: 'wrong-password' });
  expect(blocked.statusCode).toBe(429);
  expect(Number(blocked.headers['retry-after'])).toBeGreaterThan(0);
  const login = await auth.login(
    { username: owner.username, password },
    new Headers(),
    'separate-login',
  );
  const renewed = new Headers({
    cookie: cookie({ headers: { 'set-cookie': login.headers.getSetCookie() } }),
  });
  expect((await download(renewed)).statusCode).toBe(429);
  expect(await auth.getSession(owner.headers)).not.toBeNull();
  time += 900001;
  expect((await download(owner.headers)).statusCode).toBe(200);
});

it('exclui ações se o acesso for revogado após confirmar a senha e antes da leitura', async () => {
  const f = await fixture();
  await kitanda.share(f.other.headers, f.privateList, f.ownAccess);
  const confirm = auth.confirmExportPassword.bind(auth);
  vi.spyOn(auth, 'confirmExportPassword').mockImplementationOnce(async (...args) => {
    const identity = await confirm(...args);
    await kitanda.revoke(f.other.headers, f.privateList, f.ownAccess);
    return identity;
  });
  const data = (await download(f.owner.headers)).json<IndividualExport>();
  expect(data.profile.username).toBe(f.owner.username);
  expect(data.kitandaActions.some((a) => a.listId === f.ownList)).toBe(true);
  expect(data.kitandaActions.some((a) => a.listId === f.privateList)).toBe(false);
});

it('permite histórico próprio ao visualizador e não reativa concessões recebidas após reentrada', async () => {
  const f = await fixture();
  // Ações de autoria alheia continuam de fora; a própria ação anterior permanece legível.
  await items.create(f.other.headers, f.ownList, { name: 'Ação própria anterior' }, randomUUID());
  await contexts.setAccess(f.owner.headers, f.residence.id, f.other.id, 'viewer');
  let data = (await download(f.other.headers)).json<IndividualExport>();
  expect(data.memberships).toContainEqual({
    type: 'residence',
    id: f.residence.id,
    name: 'Casa própria',
    role: 'viewer',
  });
  expect(data.kitandaActions.some((a) => a.listId === f.ownList && a.type === 'item.created')).toBe(
    true,
  );
  await contexts.removeAccess(f.owner.headers, f.residence.id, f.other.id);
  data = (await download(f.other.headers)).json<IndividualExport>();
  expect(data.kitandaActions.some((a) => a.listId === f.ownList)).toBe(false);
  expect(data.memberships.some((m) => m.id === f.residence.id)).toBe(false);
  await contexts.setAccess(f.owner.headers, f.residence.id, f.other.id, 'viewer');
  data = (await download(f.other.headers)).json<IndividualExport>();
  expect(data.memberships.some((m) => m.id === f.residence.id)).toBe(true);
  expect(data.kitandaActions.some((a) => a.listId === f.ownList)).toBe(false);
  // Autoria da outra lista continua elegível com novo vínculo ativo, como no histórico.
  expect(
    data.kitandaActions.some((a) => a.listId === f.privateList && a.type === 'list.created'),
  ).toBe(true);
});

it('aplica a cota por origem somente à exportação e libera a janela após 60 segundos', async () => {
  const owner = await person();
  await db.pool.query(
    'insert into platform.auth_limits(key,events,"blockedUntil","expiresAt") values($1,$2,0,$3)',
    ['export-origin:127.0.0.1', JSON.stringify(Array(30).fill(time)), time + 60000],
  );
  const blocked = await download(owner.headers);
  expect(blocked.statusCode).toBe(429);
  expect(Number(blocked.headers['retry-after'])).toBeGreaterThan(0);
  expect(blocked.headers['content-disposition']).toBeUndefined();
  expect(
    (await auth.login({ username: owner.username, password }, new Headers(), '127.0.0.1')).ok,
  ).toBe(true);
  time += 60001;
  expect((await download(owner.headers)).statusCode).toBe(200);
});

it('impede download se a sessão expirar após confirmar a senha e antes do snapshot', async () => {
  const owner = await person();
  const confirm = auth.confirmExportPassword.bind(auth);
  vi.spyOn(auth, 'confirmExportPassword').mockImplementationOnce(async (...args) => {
    const identity = await confirm(...args);
    await db.pool.query(
      'update platform.session set "expiresAt"=clock_timestamp()-interval \'1 second\' where id=$1',
      [identity.sessionId],
    );
    return identity;
  });
  const response = await download(owner.headers);
  expect(response.statusCode).toBe(401);
  expect(response.headers['content-disposition']).toBeUndefined();
});

it('impede download se a sessão for revogada no intervalo após a confirmação da senha', async () => {
  const owner = await person();
  const confirm = auth.confirmExportPassword.bind(auth);
  vi.spyOn(auth, 'confirmExportPassword').mockImplementationOnce(async (...args) => {
    const identity = await confirm(...args);
    await auth.logout(owner.headers);
    return identity;
  });
  const response = await download(owner.headers);
  expect(response.statusCode).toBe(401);
  expect(response.headers['content-disposition']).toBeUndefined();
});

it('mantém uma fotografia consistente quando uma revogação ocorre depois do ponto de corte', async () => {
  const f = await fixture();
  await kitanda.share(f.other.headers, f.privateList, f.ownAccess);
  const reader = vi.fn(async (...args: Parameters<typeof exportOwnActions>) => {
    await kitanda.revoke(f.other.headers, f.privateList, f.ownAccess);
    return exportOwnActions(...args);
  });
  const isolated = await buildApp({
    auth,
    authOrigin: baseURL,
    individualExport: createIndividualExportService({
      ...options,
      auth,
      readKitandaActions: reader,
    }),
  });
  try {
    const response = await isolated.inject({
      method: 'POST',
      url: '/api/account/export',
      headers: { cookie: f.owner.headers.get('cookie')!, origin: baseURL },
      payload: { password },
    });
    expect(response.statusCode).toBe(200);
    expect(
      response.json<IndividualExport>().kitandaActions.some((a) => a.listId === f.privateList),
    ).toBe(true);
    await expect(kitanda.history(f.owner.headers, f.privateList)).rejects.toMatchObject({
      status: 404,
    });
  } finally {
    await isolated.close();
  }
});

it('respeita lixeira e bordas de 720h/2160h sem depender do expurgo físico', async () => {
  const f = await fixture();
  const trash = (
    await kitanda.create(f.owner.headers, f.residence.id, { name: 'Recuperável' }, randomUUID())
  ).resourceId;
  const expired = (
    await kitanda.create(f.owner.headers, f.residence.id, { name: 'Vencida' }, randomUUID())
  ).resourceId;
  await kitanda.remove(f.owner.headers, trash, 1, randomUUID());
  await kitanda.remove(f.owner.headers, expired, 1, randomUUID());
  await db.pool.query(
    'update kitanda.lists set "deletedAt"=clock_timestamp()-interval \'719 hours\' where id=$1',
    [trash],
  );
  await db.pool.query(
    'update kitanda.lists set "deletedAt"=clock_timestamp()-interval \'720 hours\' where id=$1',
    [expired],
  );
  const oldEvent = randomUUID();
  await db.pool.query(
    "insert into platform.recovery_events(id,action,actor,target,channel,\"createdAt\") values($1,'used',$2,$2,'operator',clock_timestamp()-interval '2160 hours')",
    [oldEvent, f.owner.id],
  );
  const oldSecurity = randomUUID();
  await db.pool.query(
    'insert into platform.security_events(id,action,"actorId","targetId","coreId","createdAt") values($1,\'membership.revoked\',$2,$2,$3,clock_timestamp()-interval \'2160 hours\')',
    [oldSecurity, f.owner.id, f.core.id],
  );
  await items.remove(f.owner.headers, f.ownList, f.ownItem, 1, randomUUID());
  await db.pool.query(
    'update kitanda.items set "deletedAt"=clock_timestamp()-interval \'719 hours\' where id=$1',
    [f.ownItem],
  );
  const recoverable = await download(f.owner.headers);
  expect(recoverable.statusCode).toBe(200);
  expect(recoverable.body).not.toContain('Conteúdo privado do item');
  const recoverableActions = recoverable
    .json<IndividualExport>()
    .kitandaActions.filter((a) => a.listId === f.ownList);
  await db.pool.query(
    'update kitanda.items set "deletedAt"=clock_timestamp()-interval \'720 hours\' where id=$1',
    [f.ownItem],
  );
  let data = (await download(f.owner.headers)).json<IndividualExport>();
  expect(data.kitandaActions.some((a) => a.listId === trash)).toBe(true);
  expect(data.kitandaActions.some((a) => a.listId === expired)).toBe(false);
  expect(data.securityEvents.some((e) => e.type === 'recovery.used')).toBe(false);
  expect(data.securityEvents.some((e) => e.type === 'membership.revoked')).toBe(false);
  expect(
    (await db.pool.query('select 1 from platform.security_events where id=$1', [oldSecurity]))
      .rowCount,
  ).toBe(1);
  const before = data.kitandaActions.filter((a) => a.listId === f.ownList);
  expect(before).toEqual(recoverableActions);
  expect(before.some((a) => a.type === 'item.removed')).toBe(true);
  expect(
    (await db.pool.query('select 1 from platform.recovery_events where id=$1', [oldEvent]))
      .rowCount,
  ).toBe(1);
  await kitanda.purge();
  expect(
    (await db.pool.query('select 1 from kitanda.items where id=$1', [f.ownItem])).rowCount,
  ).toBe(0);
  data = (await download(f.owner.headers)).json<IndividualExport>();
  expect(data.kitandaActions.filter((a) => a.listId === f.ownList)).toEqual(before);
  expect(
    (await db.pool.query('select 1 from platform.recovery_events where id=$1', [oldEvent]))
      .rowCount,
  ).toBe(0);
  await db.pool.query(
    'update kitanda.lists set "deletedAt"=clock_timestamp()-interval \'720 hours\' where id=$1',
    [trash],
  );
  expect(
    (await download(f.owner.headers))
      .json<IndividualExport>()
      .kitandaActions.some((a) => a.listId === trash),
  ).toBe(false);
});

it('não devolve anexo parcial nem detalhes internos quando a geração falha', async () => {
  const owner = await person();
  const isolated = await buildApp({
    auth,
    authOrigin: baseURL,
    individualExport: createIndividualExportService({
      ...options,
      auth,
      readKitandaActions: async () => {
        throw new Error('private-generation-marker');
      },
    }),
  });
  try {
    const response = await isolated.inject({
      method: 'POST',
      url: '/api/account/export',
      headers: { cookie: owner.headers.get('cookie')!, origin: baseURL },
      payload: { password },
    });
    expect(response.statusCode).toBe(503);
    expect(response.headers['content-disposition']).toBeUndefined();
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.json().error.code).toBe('EXPORT_UNAVAILABLE');
    expect(response.body).not.toContain('private-generation-marker');
    expect(response.body).not.toContain('profile');
  } finally {
    await isolated.close();
  }
});
