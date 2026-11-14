import { createItemService } from '../src/modules/kitanda/items.js';
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
  items = createItemService({ ...options, now: () => clock });
  kitanda = createKitandaService({ ...options, now: () => clock });
  app = await buildApp({
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

async function listFixture() {
  const f = await fixture();
  const l = await kitanda.create(f.owner.headers, f.residence.id, { name: 'Lista' }, randomUUID());
  await kitanda.share(f.owner.headers, l.resourceId, f.memberAccess);
  return { ...f, listId: l.resourceId };
}
it('versões por item preservam edições distintas e rejeitam versão antiga do mesmo item', async () => {
  const { owner, member, listId } = await listFixture();
  const a = await items.create(owner.headers, listId, { name: 'A' }, randomUUID()),
    b = await items.create(owner.headers, listId, { name: 'B' }, randomUUID());
  await Promise.all([
    items.update(
      owner.headers,
      listId,
      a.resourceId,
      { name: 'A2', expectedVersion: 1 },
      randomUUID(),
    ),
    items.update(
      member.headers,
      listId,
      b.resourceId,
      { name: 'B2', expectedVersion: 1 },
      randomUUID(),
    ),
  ]);
  await expect(
    items.update(
      member.headers,
      listId,
      a.resourceId,
      { name: 'Antigo', expectedVersion: 1 },
      randomUUID(),
    ),
  ).rejects.toMatchObject({ status: 409, code: 'ITEM_VERSION_CONFLICT' });
  expect(
    (await items.collection(owner.headers, listId)).map((i) => [i.name, i.version]).sort(),
  ).toEqual([
    ['A2', 2],
    ['B2', 2],
  ]);
});
it('mesmo item concorrente só muda uma vez, no-op não incrementa versão nem timestamp', async () => {
  const { owner, member, listId } = await listFixture(),
    a = await items.create(owner.headers, listId, { name: 'A' }, randomUUID());
  const results = await Promise.allSettled([
    items.purchased(owner.headers, listId, a.resourceId, true, 1, randomUUID()),
    items.update(
      member.headers,
      listId,
      a.resourceId,
      { name: 'Outro', expectedVersion: 1 },
      randomUUID(),
    ),
  ]);
  expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
  const current = (await items.collection(owner.headers, listId))[0]!;
  await items.purchased(
    owner.headers,
    listId,
    current.id,
    current.purchased,
    current.version,
    randomUUID(),
  );
  expect((await items.collection(owner.headers, listId))[0]).toEqual(current);
});
it('confirma repetição sem reaplicar mesmo após outras edições ou remoção e não devolve conteúdo antigo', async () => {
  const { owner, listId } = await listFixture(),
    key = randomUUID(),
    a = await items.create(owner.headers, listId, { name: 'Segredo' }, key);
  const updateKey = randomUUID();
  await items.update(
    owner.headers,
    listId,
    a.resourceId,
    { name: 'Novo', expectedVersion: 1 },
    updateKey,
  );
  expect(await items.create(owner.headers, listId, { name: ' Segredo ' }, key)).toEqual(a);
  await expect(
    items.update(
      owner.headers,
      listId,
      a.resourceId,
      { name: 'Novo', expectedVersion: 2 },
      updateKey,
    ),
  ).rejects.toMatchObject({ status: 409, code: 'IDEMPOTENCY_KEY_REUSED' });
  const removeKey = randomUUID();
  const receipt = await items.remove(owner.headers, listId, a.resourceId, 2, removeKey);
  expect(await items.remove(owner.headers, listId, a.resourceId, 2, removeKey)).toEqual(receipt);
  expect(JSON.stringify(a)).not.toContain('Segredo');
  expect(await items.collection(owner.headers, listId)).toHaveLength(0);
});
it('mesma chave concorrente tem um efeito; payload diferente retorna 409', async () => {
  const { owner, listId } = await listFixture(),
    key = randomUUID();
  const receipts = await Promise.all([
    items.create(owner.headers, listId, { name: 'A' }, key),
    items.create(owner.headers, listId, { name: 'A' }, key),
  ]);
  expect(receipts[0]).toEqual(receipts[1]);
  expect(await items.collection(owner.headers, listId)).toHaveLength(1);
  await expect(items.create(owner.headers, listId, { name: 'B' }, key)).rejects.toMatchObject({
    status: 409,
    code: 'IDEMPOTENCY_KEY_REUSED',
  });
});
it('criação de lista é deduplicada e conta/ação/recurso separam comprovantes', async () => {
  const { owner, member, residence, listId } = await listFixture(),
    key = randomUUID();
  const a = await kitanda.create(owner.headers, residence.id, { name: 'Outra' }, key);
  expect(await kitanda.create(owner.headers, residence.id, { name: ' Outra ' }, key)).toEqual(a);
  expect((await items.create(owner.headers, listId, { name: 'X' }, key)).resourceId).not.toBe(
    a.resourceId,
  );
  expect((await items.create(member.headers, listId, { name: 'X' }, key)).resourceId).not.toBe(
    a.resourceId,
  );
  const other = await kitanda.create(
    owner.headers,
    residence.id,
    { name: 'Pai diferente' },
    randomUUID(),
  );
  await expect(
    items.create(owner.headers, other.resourceId, { name: 'X' }, key),
  ).resolves.toMatchObject({ confirmed: true });
});
it('revogação impede repetição, inclusive acesso ao comprovante', async () => {
  const { owner, member, memberAccess, listId, residence } = await listFixture(),
    key = randomUUID();
  await items.create(member.headers, listId, { name: 'A' }, key);
  await service.setAccess(owner.headers, residence.id, member.id, 'viewer');
  await expect(items.create(member.headers, listId, { name: 'A' }, key)).rejects.toMatchObject({
    status: 403,
  });
  await service.setAccess(owner.headers, residence.id, member.id, 'collaborator');
  await kitanda.revoke(owner.headers, listId, memberAccess);
  await expect(items.create(member.headers, listId, { name: 'A' }, key)).rejects.toMatchObject({
    status: 404,
  });
});
it('falha ao registrar comprovante reverte efeito; nova tentativa após falha pode confirmar', async () => {
  const { owner, listId } = await listFixture(),
    key = randomUUID();
  await db.pool.query(
    "create or replace function kitanda.receipt_test_fail() returns trigger language plpgsql as $$ begin raise exception 'injected'; end $$",
  );
  await db.pool.query(
    'create trigger receipt_test_fail before insert on kitanda.mutation_receipts for each row execute function kitanda.receipt_test_fail()',
  );
  try {
    await expect(items.create(owner.headers, listId, { name: 'A' }, key)).rejects.toMatchObject({
      status: 503,
    });
  } finally {
    await db.pool.query('drop trigger receipt_test_fail on kitanda.mutation_receipts');
  }
  expect(await items.collection(owner.headers, listId)).toHaveLength(0);
  await items.create(owner.headers, listId, { name: 'A' }, key);
  expect(await items.collection(owner.headers, listId)).toHaveLength(1);
});
it('janela de 24h expira na borda e limpeza é limitada a lotes', async () => {
  const { owner, listId } = await listFixture(),
    key = randomUUID(),
    first = await items.create(owner.headers, listId, { name: 'A' }, key);
  clock += 86400000 - 1;
  expect(await items.create(owner.headers, listId, { name: 'A' }, key)).toEqual(first);
  clock++;
  expect((await items.create(owner.headers, listId, { name: 'A' }, key)).resourceId).not.toBe(
    first.resourceId,
  );
  expect(await items.collection(owner.headers, listId)).toHaveLength(2);
  await db.pool.query(
    'insert into kitanda.mutation_receipts(id,"userId",action,"parentId",key,fingerprint,"resourceId",version,"createdAt","expiresAt") select gen_random_uuid(),$1,\'cleanup-test\',$2,gen_random_uuid(),\'digest\',gen_random_uuid(),1,$3,$4 from generate_series(1,505)',
    [owner.id, listId, new Date(clock - 1000), new Date(clock - 1)],
  );
  const before = Number(
    (await db.pool.query('select count(*) total from kitanda.mutation_receipts')).rows[0].total,
  );
  await kitanda.cleanup();
  expect(
    Number(
      (await db.pool.query('select count(*) total from kitanda.mutation_receipts')).rows[0].total,
    ),
  ).toBe(before - 500);
  await kitanda.cleanup();
  expect(
    (
      await db.pool.query('select id from kitanda.mutation_receipts where "expiresAt"<=$1', [
        new Date(clock),
      ])
    ).rows,
  ).toHaveLength(0);
  expect((await db.pool.query('select id from kitanda.mutation_receipts')).rows).toHaveLength(1);
});
it('remoção concorrente com edição e versão esperada impede sobrescrita', async () => {
  const { owner, member, listId } = await listFixture(),
    a = await items.create(owner.headers, listId, { name: 'A' }, randomUUID());
  const result = await Promise.allSettled([
    items.remove(owner.headers, listId, a.resourceId, 1, randomUUID()),
    items.update(
      member.headers,
      listId,
      a.resourceId,
      { name: 'B', expectedVersion: 1 },
      randomUUID(),
    ),
  ]);
  expect(result.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
});
it('HTTP exige UUID e versão, devolve comprovante após resposta perdida', async () => {
  const { owner, listId } = await listFixture(),
    url = '/api/kitanda/lists/' + listId + '/items',
    headers = {
      origin: baseURL,
      cookie: owner.headers.get('cookie')!,
      'idempotency-key': randomUUID(),
    };
  expect(
    (
      await app.inject({
        method: 'POST',
        url,
        headers: { ...headers, 'idempotency-key': 'bad' },
        payload: { name: 'A' },
      })
    ).statusCode,
  ).toBe(400);
  const first = await app.inject({ method: 'POST', url, headers, payload: { name: 'A' } });
  expect(first.statusCode).toBe(201);
  const again = await app.inject({ method: 'POST', url, headers, payload: { name: 'A' } });
  expect(again.json()).toEqual(first.json());
  expect(again.json()).toMatchObject({ confirmed: true, version: 1 });
  expect(
    (
      await app.inject({
        method: 'PATCH',
        url: url + '/' + first.json().resourceId,
        headers: { ...headers, 'idempotency-key': randomUUID() },
        payload: { name: 'B' },
      })
    ).statusCode,
  ).toBe(400);
});
