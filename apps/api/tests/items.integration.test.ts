import { createItemService } from '../src/modules/kitanda/items.js';
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
let items: ReturnType<typeof createItemService>;
let kitanda: ReturnType<typeof createKitandaService>;
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
  items = createItemService(options);
  kitanda = createKitandaService({ ...options, now: () => clock });
  app = await buildApp({
    logger: createLogger('info', {
      write: (line: string) => {
        logs += line;
      },
    }),
    auth,
    authOrigin: baseURL,
    contexts: service,
    kitanda,
    items,
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

it('cria itens pendentes com opcionais independentes, duplica nomes e retorna decimal canônico', async () => {
  const { owner, residence } = await fixture(),
    list = await kitanda.create(owner.headers, residence.id, { name: 'Lista' });
  const first = await items.create(owner.headers, list.id, {
    name: ' Café ',
    quantity: '0001.200',
    unit: ' kg ',
    notes: ' anotação ',
  });
  expect(first).toMatchObject({
    name: 'Café',
    quantity: '1.2',
    unit: 'kg',
    notes: 'anotação',
    purchased: false,
  });
  expect(await items.create(owner.headers, list.id, { name: 'Café', unit: 'un' })).toMatchObject({
    quantity: null,
    unit: 'un',
    notes: null,
  });
  expect(await items.create(owner.headers, list.id, { name: 'Café', quantity: '2' })).toMatchObject(
    { quantity: '2', unit: null },
  );
  expect(await items.collection(owner.headers, list.id)).toHaveLength(3);
});
it('PATCH parcial preserva omitidos e compra; null limpa opcionais', async () => {
  const { owner, residence } = await fixture(),
    list = await kitanda.create(owner.headers, residence.id, { name: 'Lista' }),
    item = await items.create(owner.headers, list.id, {
      name: 'Arroz',
      quantity: '2',
      unit: 'kg',
      notes: 'Integral',
    });
  await items.purchased(owner.headers, list.id, item.id, true);
  expect(
    await items.update(owner.headers, list.id, item.id, { name: ' Arroz  integral ' }),
  ).toMatchObject({
    name: 'Arroz  integral',
    quantity: '2',
    unit: 'kg',
    notes: 'Integral',
    purchased: true,
  });
  expect(
    await items.update(owner.headers, list.id, item.id, {
      quantity: null,
      unit: null,
      notes: null,
    }),
  ).toMatchObject({ quantity: null, unit: null, notes: null, purchased: true });
});
it('repetir marcação mantém estado e timestamp, sem inversão', async () => {
  const { owner, residence } = await fixture(),
    list = await kitanda.create(owner.headers, residence.id, { name: 'Lista' }),
    item = await items.create(owner.headers, list.id, { name: 'Pão' });
  const bought = await items.purchased(owner.headers, list.id, item.id, true);
  expect(await items.purchased(owner.headers, list.id, item.id, true)).toEqual(bought);
  expect(await items.purchased(owner.headers, list.id, item.id, false)).toMatchObject({
    purchased: false,
  });
});
it('resumos contam itens ativos com peso igual e lista segue reutilizável após 100%', async () => {
  const { owner, member, residence } = await fixture(),
    list = await kitanda.create(owner.headers, residence.id, { name: 'Lista' });
  const card = () =>
    kitanda
      .collection(owner.headers, residence.id)
      .then((rows) => rows.find((r) => r.id === list.id));
  expect(await card()).toMatchObject({
    residenceName: 'Residência',
    totalActive: 0,
    totalPurchased: 0,
  });
  const a = await items.create(owner.headers, list.id, { name: 'A', quantity: '999999.999' }),
    b = await items.create(owner.headers, list.id, { name: 'B' }),
    c = await items.create(owner.headers, list.id, { name: 'C', quantity: '0.001' });
  await items.purchased(owner.headers, list.id, a.id, true);
  expect(await card()).toMatchObject({ totalActive: 3, totalPurchased: 1 });
  await items.purchased(owner.headers, list.id, b.id, true);
  await items.purchased(owner.headers, list.id, c.id, true);
  expect(await card()).toMatchObject({ totalActive: 3, totalPurchased: 3 });
  await items.purchased(owner.headers, list.id, a.id, false);
  await items.remove(owner.headers, list.id, b.id);
  expect(await card()).toMatchObject({ totalActive: 2, totalPurchased: 1 });
  expect(await kitanda.collection(member.headers, residence.id)).toHaveLength(0);
  expect((await items.create(owner.headers, list.id, { name: 'Nova compra' })).purchased).toBe(
    false,
  );
});
it('remoção é lógica e exclui item de coleção e mutações', async () => {
  const { owner, residence } = await fixture(),
    list = await kitanda.create(owner.headers, residence.id, { name: 'Lista' }),
    item = await items.create(owner.headers, list.id, { name: 'Preservado' });
  await items.remove(owner.headers, list.id, item.id);
  expect(await items.collection(owner.headers, list.id)).toHaveLength(0);
  const row = (await db.pool.query('select * from kitanda.items where id=$1', [item.id])).rows[0];
  expect(row.deletedAt).not.toBeNull();
  expect(row.name).toBe('Preservado');
  await expect(
    items.update(owner.headers, list.id, item.id, { name: 'Indevido' }),
  ).rejects.toMatchObject({ status: 404 });
  await expect(items.purchased(owner.headers, list.id, item.id, true)).rejects.toMatchObject({
    status: 404,
  });
});
it('papel atual, privacidade e revogação protegem itens e resumos', async () => {
  const { owner, member, viewer, residence, memberAccess, viewerAccess } = await fixture(),
    list = await kitanda.create(owner.headers, residence.id, { name: 'Lista' }),
    item = await items.create(owner.headers, list.id, { name: 'Item' });
  await expect(items.collection(member.headers, list.id)).rejects.toMatchObject({ status: 404 });
  await kitanda.share(owner.headers, list.id, viewerAccess);
  await expect(items.create(viewer.headers, list.id, { name: 'Negado' })).rejects.toMatchObject({
    status: 403,
  });
  await service.setAccess(owner.headers, residence.id, owner.id, 'viewer');
  await expect(
    items.update(owner.headers, list.id, item.id, { name: 'Negado' }),
  ).rejects.toMatchObject({ status: 403 });
  await expect(items.purchased(owner.headers, list.id, item.id, true)).rejects.toMatchObject({
    status: 403,
  });
  await expect(items.remove(owner.headers, list.id, item.id)).rejects.toMatchObject({
    status: 403,
  });
  await service.setAccess(owner.headers, residence.id, owner.id, 'responsible');
  await kitanda.share(owner.headers, list.id, memberAccess);
  await items.purchased(member.headers, list.id, item.id, true);
  await kitanda.revoke(owner.headers, list.id, memberAccess);
  await expect(items.collection(member.headers, list.id)).rejects.toMatchObject({ status: 404 });
  expect(await kitanda.collection(member.headers, residence.id)).toHaveLength(0);
});
it('item é resolvido pelo par lista/item, inclusive em outra residência e núcleo', async () => {
  const { owner, outsider, residence } = await fixture(),
    list = await kitanda.create(owner.headers, residence.id, { name: 'A' }),
    otherList = await kitanda.create(owner.headers, residence.id, { name: 'B' }),
    item = await items.create(owner.headers, list.id, { name: 'Privado' });
  const core = await service.createCore(outsider.headers, 'Outro'),
    otherResidence = await service.createResidence(outsider.headers, core.id, {
      name: 'Outra',
      responsibleUserId: outsider.id,
    }),
    foreignList = await kitanda.create(outsider.headers, otherResidence.id, { name: 'C' });
  for (const [actor, target] of [
    [owner, otherList],
    [outsider, foreignList],
  ] as const) {
    await expect(
      items.update(actor.headers, target.id, item.id, { name: 'Adulterado' }),
    ).rejects.toMatchObject({ status: 404 });
    await expect(items.remove(actor.headers, target.id, item.id)).rejects.toMatchObject({
      status: 404,
    });
  }
  expect((await items.collection(owner.headers, list.id))[0]!.name).toBe('Privado');
});
it('HTTP valida decimais e schemas, nega origem e não expõe ações futuras', async () => {
  const { owner, residence } = await fixture(),
    list = await kitanda.create(owner.headers, residence.id, { name: 'Lista' }),
    url = '/api/kitanda/lists/' + list.id + '/items',
    headers = { origin: baseURL, cookie: owner.headers.get('cookie')! };
  for (const payload of [
    { name: 'Item', quantity: '1e3' },
    { name: 'Item', quantity: 1 },
    { name: 'Item', quantity: '1.0000' },
    { name: 'Item', price: '5' },
    { name: 'Item', purchased: true },
  ])
    expect((await app.inject({ method: 'POST', url, headers, payload })).statusCode).toBe(400);
  const response = await app.inject({
    method: 'POST',
    url,
    headers,
    payload: { name: 'Item', quantity: '0.500' },
  });
  expect(response.statusCode).toBe(201);
  expect(response.json().quantity).toBe('0.5');
  expect(
    (
      await app.inject({
        method: 'PATCH',
        url: url + '/' + response.json().id,
        headers,
        payload: {},
      })
    ).statusCode,
  ).toBe(400);
  expect(
    (
      await app.inject({
        method: 'PUT',
        url: url + '/' + response.json().id + '/purchased',
        headers: { cookie: headers.cookie },
        payload: { purchased: true },
      })
    ).statusCode,
  ).toBe(403);
});
it('logs não incluem conteúdo dos itens', async () => {
  const { owner, residence } = await fixture(),
    list = await kitanda.create(owner.headers, residence.id, { name: 'Lista' });
  logs = '';
  const response = await app.inject({
    method: 'POST',
    url: '/api/kitanda/lists/' + list.id + '/items',
    headers: { origin: baseURL, cookie: owner.headers.get('cookie')! },
    payload: { name: 'private-item-marker', notes: 'private-note-marker' },
  });
  expect(response.statusCode).toBe(201);
  expect(logs).not.toContain('private-item-marker');
  expect(logs).not.toContain('private-note-marker');
});
it('revalida acesso enquanto mutação de item espera por lock', async () => {
  const { owner, member, residence, memberAccess } = await fixture(),
    list = await kitanda.create(owner.headers, residence.id, { name: 'Lista' });
  await kitanda.share(owner.headers, list.id, memberAccess);
  const item = await items.create(owner.headers, list.id, { name: 'Original' }),
    locker = await db.pool.connect();
  await locker.query('begin');
  await locker.query('select pg_advisory_xact_lock(hashtext($1))', ['residence:' + residence.id]);
  await locker.query('update platform.residence_accesses set "revokedAt"=now() where id=$1', [
    memberAccess,
  ]);
  const assertion = expect(
    items.purchased(member.headers, list.id, item.id, true),
  ).rejects.toMatchObject({ status: 404 });
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
  expect((await items.collection(owner.headers, list.id))[0]!.purchased).toBe(false);
});
