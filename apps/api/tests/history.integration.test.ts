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
async function all(h: Headers, id: string) {
  const events = [];
  let cursor: string | undefined;
  do {
    const page = await kitanda.history(h, id, { limit: 50, ...(cursor ? { cursor } : {}) });
    events.push(...page.events);
    cursor = page.nextCursor ?? undefined;
  } while (cursor);
  return events;
}
it('registra todos os tipos do Kitanda com ator, UTC, diferenças e alvos individuais do lote', async () => {
  const { owner, member, listId, memberAccess } = await listFixture();
  await kitanda.update(owner.headers, listId, { name: 'Lista nova', description: 'Descrição' });
  const a = await items.create(
    member.headers,
    listId,
    { name: 'Arroz', quantity: '1', unit: 'kg', notes: 'Antes' },
    randomUUID(),
  );
  await items.update(
    member.headers,
    listId,
    a.resourceId,
    { quantity: '2', unit: 'pacote', notes: 'Depois', expectedVersion: 1 },
    randomUUID(),
  );
  await items.purchased(owner.headers, listId, a.resourceId, true, 2, randomUUID());
  await items.purchased(owner.headers, listId, a.resourceId, false, 3, randomUUID());
  await items.remove(owner.headers, listId, a.resourceId, 4, randomUUID());
  const b = await items.create(owner.headers, listId, { name: 'Feijão' }, randomUUID());
  await items.purchased(owner.headers, listId, b.resourceId, true, 1, randomUUID());
  await kitanda.clearPurchased(
    owner.headers,
    listId,
    [{ itemId: b.resourceId, expectedVersion: 2 }],
    randomUUID(),
  );
  await kitanda.revoke(owner.headers, listId, memberAccess);
  await kitanda.remove(owner.headers, listId, 1, randomUUID());
  await kitanda.restore(owner.headers, listId, 2, randomUUID());
  const events = await all(owner.headers, listId);
  expect(new Set(events.map((e) => e.action))).toEqual(
    new Set([
      'list.created',
      'list.updated',
      'list.removed',
      'list.restored',
      'share.granted',
      'share.revoked',
      'item.created',
      'item.updated',
      'item.purchased',
      'item.unpurchased',
      'item.removed',
      'items.cleared',
    ]),
  );
  for (const e of events)
    expect(e).toMatchObject({
      id: expect.any(String),
      listId,
      actor: { id: expect.any(String), name: expect.any(String) },
      occurredAt: expect.stringMatching(/Z$/),
    });
  const edit = events.find((e) => e.action === 'item.updated')!;
  expect(edit.actor.id).toBe(member.id);
  expect(edit.targets[0]).toMatchObject({
    itemId: a.resourceId,
    details: {
      changes: {
        quantity: { before: '1', after: '2' },
        unit: { before: 'kg', after: 'pacote' },
        notes: { before: 'Antes', after: 'Depois' },
      },
    },
  });
  expect(Object.keys(edit.targets[0]!.details!.changes).sort()).toEqual([
    'notes',
    'quantity',
    'unit',
  ]);
  expect(events.find((e) => e.action === 'items.cleared')!.targets.map((t) => t.itemId)).toEqual([
    b.resourceId,
  ]);
});
it('comprovante repetido e no-op não criam eventos adicionais nem mudam timestamps', async () => {
  const { owner, listId, residence, memberAccess } = await listFixture(),
    key = randomUUID();
  const a = await items.create(owner.headers, listId, { name: 'A' }, key);
  await items.create(owner.headers, listId, { name: ' A ' }, key);
  await items.update(
    owner.headers,
    listId,
    a.resourceId,
    { name: 'A', expectedVersion: 1 },
    randomUUID(),
  );
  await items.purchased(owner.headers, listId, a.resourceId, false, 1, randomUUID());
  const before = await kitanda.detail(owner.headers, listId);
  await kitanda.update(owner.headers, listId, { name: before.name });
  expect(await kitanda.detail(owner.headers, listId)).toEqual(before);
  await kitanda.share(owner.headers, listId, memberAccess);
  const listKey = randomUUID();
  await kitanda.create(owner.headers, residence.id, { name: 'B' }, listKey);
  await kitanda.create(owner.headers, residence.id, { name: 'B' }, listKey);
  expect((await all(owner.headers, listId)).map((e) => e.action).sort()).toEqual([
    'item.created',
    'list.created',
    'share.granted',
  ]);
});
async function failing(table: string, run: () => Promise<void>) {
  await db.pool.query(
    "create or replace function kitanda.history_test_fail() returns trigger language plpgsql as $$ begin raise exception 'injected'; end $$",
  );
  await db.pool.query(
    'create trigger history_test_fail before insert on kitanda.' +
      table +
      ' for each row execute function kitanda.history_test_fail()',
  );
  try {
    await run();
  } finally {
    await db.pool.query('drop trigger history_test_fail on kitanda.' + table);
  }
}
it('falha de evento reverte criação, metadados, compartilhamento, lote, ciclo e comprovante', async () => {
  const { owner, listId, residence, viewerAccess } = await listFixture();
  const a = await items.create(owner.headers, listId, { name: 'A' }, randomUUID());
  await items.purchased(owner.headers, listId, a.resourceId, true, 1, randomUUID());
  const before = await all(owner.headers, listId),
    key = randomUUID();
  await failing('history_events', async () => {
    for (const operation of [
      () => kitanda.create(owner.headers, residence.id, { name: 'Negada' }, randomUUID()),
      () => kitanda.update(owner.headers, listId, { name: 'Negada' }),
      () => kitanda.share(owner.headers, listId, viewerAccess),
      () =>
        kitanda.clearPurchased(
          owner.headers,
          listId,
          [{ itemId: a.resourceId, expectedVersion: 2 }],
          key,
        ),
      () => kitanda.remove(owner.headers, listId, 1, randomUUID()),
    ])
      await expect(operation()).rejects.toMatchObject({ status: 503 });
  });
  expect((await kitanda.detail(owner.headers, listId)).name).toBe('Lista');
  expect((await items.collection(owner.headers, listId))[0]!.version).toBe(2);
  expect(await all(owner.headers, listId)).toEqual(before);
  await kitanda.clearPurchased(
    owner.headers,
    listId,
    [{ itemId: a.resourceId, expectedVersion: 2 }],
    key,
  );
  await kitanda.remove(owner.headers, listId, 1, randomUUID());
  await failing('history_events', async () => {
    await expect(kitanda.restore(owner.headers, listId, 2, randomUUID())).rejects.toMatchObject({
      status: 503,
    });
  });
  expect(await kitanda.trash(owner.headers, residence.id)).toHaveLength(1);
});
it('falha no alvo do evento reverte criação/edição/compra/remoção do item', async () => {
  const { owner, listId } = await listFixture(),
    a = await items.create(owner.headers, listId, { name: 'A' }, randomUUID());
  const before = await all(owner.headers, listId);
  await failing('history_targets', async () => {
    for (const op of [
      () => items.create(owner.headers, listId, { name: 'B' }, randomUUID()),
      () =>
        items.update(
          owner.headers,
          listId,
          a.resourceId,
          { name: 'B', expectedVersion: 1 },
          randomUUID(),
        ),
      () => items.purchased(owner.headers, listId, a.resourceId, true, 1, randomUUID()),
      () => items.remove(owner.headers, listId, a.resourceId, 1, randomUUID()),
    ])
      await expect(op()).rejects.toMatchObject({ status: 503 });
  });
  expect(await all(owner.headers, listId)).toEqual(before);
  expect((await items.collection(owner.headers, listId))[0]).toMatchObject({
    name: 'A',
    version: 1,
  });
});
it('paginação usa instante/ID precisos, vincula cursor à lista e reautoriza cada página', async () => {
  const { owner, member, viewer, viewerAccess, memberAccess, listId, core, residence } =
    await listFixture();
  await kitanda.share(owner.headers, listId, viewerAccess);
  for (let n = 0; n < 6; n++)
    await items.create(owner.headers, listId, { name: 'Item' + n }, randomUUID());
  // Empates com microssegundos exercitam o desempate sem truncamento por Date.
  await db.pool.query(
    'update kitanda.history_events set "createdAt"=\'2026-11-08T12:00:00.123456Z\' where "listId"=$1',
    [listId],
  );
  const expected = (
    await db.pool.query(
      'select id from kitanda.history_events where "listId"=$1 order by "createdAt" desc,id desc',
      [listId],
    )
  ).rows.map((r) => r.id);
  const seen: string[] = [];
  let cursor: string | undefined;
  do {
    const p = await kitanda.history(viewer.headers, listId, {
      limit: 2,
      ...(cursor ? { cursor } : {}),
    });
    seen.push(...p.events.map((e) => e.id));
    cursor = p.nextCursor ?? undefined;
  } while (cursor);
  expect(seen).toEqual(expected);
  const first = await kitanda.history(member.headers, listId, { limit: 2 });
  expect(first.nextCursor).not.toBeNull();
  const secondResidence = await service.createResidence(owner.headers, core.id, {
    name: 'Outra residência',
    responsibleUserId: owner.id,
  });
  const other = await kitanda.create(
    owner.headers,
    secondResidence.id,
    { name: 'Outra' },
    randomUUID(),
  );
  await expect(kitanda.history(viewer.headers, other.resourceId, {})).rejects.toMatchObject({
    status: 404,
  });
  expect(JSON.stringify(await kitanda.history(owner.headers, other.resourceId, {}))).not.toContain(
    'Item0',
  );
  await expect(kitanda.history(viewer.headers, other.resourceId, {})).rejects.toMatchObject({
    status: 404,
  });
  expect(JSON.stringify(await kitanda.history(owner.headers, other.resourceId, {}))).not.toContain(
    'Item0',
  );
  await expect(
    kitanda.history(owner.headers, other.resourceId, { cursor: first.nextCursor! }),
  ).rejects.toMatchObject({ status: 400 });
  await expect(
    kitanda.history(owner.headers, listId, { cursor: first.nextCursor! + 'x' }),
  ).rejects.toMatchObject({ status: 400 });
  await kitanda.revoke(owner.headers, listId, memberAccess);
  await expect(
    kitanda.history(member.headers, listId, { cursor: first.nextCursor! }),
  ).rejects.toMatchObject({ status: 404 });
  await kitanda.remove(owner.headers, listId, 1, randomUUID());
  expect((await kitanda.history(viewer.headers, listId, {})).events.length).toBeGreaterThan(0);
  await service.removeAccess(owner.headers, residence.id, viewer.id);
  await expect(kitanda.history(viewer.headers, listId, {})).rejects.toMatchObject({ status: 404 });
});
it('admin/autoria de evento não ampliam acesso e o histórico HTTP segue envelope/cache/sessão', async () => {
  const { owner, member, outsider, listId, residence, memberAccess } = await listFixture();
  await items.create(member.headers, listId, { name: 'Privado' }, randomUUID());
  await kitanda.revoke(owner.headers, listId, memberAccess);
  await expect(kitanda.history(member.headers, listId, {})).rejects.toMatchObject({ status: 404 });
  const other = await kitanda.create(
    member.headers,
    residence.id,
    { name: 'Privada' },
    randomUUID(),
  );
  await expect(kitanda.history(owner.headers, other.resourceId, {})).rejects.toMatchObject({
    status: 404,
  });
  await db.pool.query('update platform."user" set "globalAdmin"=true where id=$1', [outsider.id]);
  await expect(kitanda.history(outsider.headers, listId, {})).rejects.toMatchObject({
    status: 404,
  });
  const url = '/api/kitanda/lists/' + listId + '/history';
  const response = await app.inject({
    method: 'GET',
    url,
    headers: { cookie: owner.headers.get('cookie')! },
  });
  expect(response.statusCode).toBe(200);
  expect(response.headers['cache-control']).toBe('no-store');
  expect((await app.inject({ method: 'GET', url })).statusCode).toBe(401);
  expect(
    (
      await app.inject({
        method: 'GET',
        url: url + '?limit=0',
        headers: { cookie: owner.headers.get('cookie')! },
      })
    ).statusCode,
  ).toBe(400);
});
it('conteúdo vencido é ocultado antes do expurgo e redação respeita cada alvo do lote', async () => {
  const { owner, listId } = await listFixture();
  const ids: string[] = [];
  for (const name of ['Vencido', 'Recente']) {
    const a = await items.create(
      owner.headers,
      listId,
      { name, notes: 'segredo-' + name },
      randomUUID(),
    );
    ids.push(a.resourceId);
    await items.purchased(owner.headers, listId, a.resourceId, true, 1, randomUUID());
  }
  await items.update(
    owner.headers,
    listId,
    ids[0]!,
    { name: 'Vencido novo', expectedVersion: 2 },
    randomUUID(),
  );
  await kitanda.clearPurchased(
    owner.headers,
    listId,
    [
      { itemId: ids[0]!, expectedVersion: 3 },
      { itemId: ids[1]!, expectedVersion: 2 },
    ],
    randomUUID(),
  );
  await db.pool.query(
    "update kitanda.items set \"deletedAt\"=clock_timestamp()-interval '720 hours'+interval '1 second' where id=$1",
    [ids[0]],
  );
  expect(JSON.stringify(await all(owner.headers, listId))).toContain('segredo-Vencido');
  await db.pool.query(
    'update kitanda.items set "deletedAt"=clock_timestamp()-interval \'720 hours\' where id=$1',
    [ids[0]],
  );
  const events = await all(owner.headers, listId);
  expect(JSON.stringify(events)).not.toContain('Vencido');
  expect(
    events
      .filter((e) => e.targets.some((t) => t.itemId === ids[0]))
      .every((e) => e.targets.find((t) => t.itemId === ids[0])!.details === null),
  ).toBe(true);
  expect(JSON.stringify(events)).toContain('segredo-Recente');
  const metadata = events.map((e) => ({
    id: e.id,
    action: e.action,
    actor: e.actor,
    occurredAt: e.occurredAt,
  }));
  expect(await kitanda.purge()).toMatchObject({ items: 1, failed: 0 });
  expect(
    (
      await db.pool.query(
        'select details,"redactedAt" from kitanda.history_targets where "itemId"=$1',
        [ids[0]],
      )
    ).rows.every((r) => r.details === null && r.redactedAt !== null),
  ).toBe(true);
  expect(
    (await all(owner.headers, listId)).map((e) => ({
      id: e.id,
      action: e.action,
      actor: e.actor,
      occurredAt: e.occurredAt,
    })),
  ).toEqual(metadata);
});
it('falha no expurgo reverte redação/histórico; reinício e concorrência retomam sem perda', async () => {
  const { owner, listId } = await listFixture(),
    a = await items.create(owner.headers, listId, { name: 'Retido' }, randomUUID());
  await items.remove(owner.headers, listId, a.resourceId, 1, randomUUID());
  await db.pool.query(
    'update kitanda.items set "deletedAt"=clock_timestamp()-interval \'721 hours\' where id=$1',
    [a.resourceId],
  );
  await db.pool.query(
    "create or replace function kitanda.purge_history_fail() returns trigger language plpgsql as $$ begin raise exception 'injected'; end $$",
  );
  await db.pool.query(
    'create trigger purge_history_fail before delete on kitanda.items for each row execute function kitanda.purge_history_fail()',
  );
  try {
    expect(await kitanda.purge()).toMatchObject({ failed: 1 });
  } finally {
    await db.pool.query('drop trigger purge_history_fail on kitanda.items');
  }
  expect(
    (
      await db.pool.query('select details from kitanda.history_targets where "itemId"=$1', [
        a.resourceId,
      ])
    ).rows.every((r) => r.details !== null),
  ).toBe(true);
  const restarted = createKitandaService(options);
  const result = await Promise.all([kitanda.purge(), restarted.purge()]);
  expect(result.reduce((n, r) => n + r.items, 0)).toBe(1);
  await kitanda.remove(owner.headers, listId, 1, randomUUID());
  await db.pool.query(
    'update kitanda.lists set "deletedAt"=clock_timestamp()-interval \'720 hours\' where id=$1',
    [listId],
  );
  await db.pool.query(
    'create trigger purge_history_fail before delete on kitanda.lists for each row execute function kitanda.purge_history_fail()',
  );
  try {
    expect(await kitanda.purge()).toMatchObject({ failed: 1 });
  } finally {
    await db.pool.query('drop trigger purge_history_fail on kitanda.lists');
  }
  expect(
    (await db.pool.query('select id from kitanda.history_events where "listId"=$1', [listId])).rows
      .length,
  ).toBeGreaterThan(0);
  await expect(kitanda.history(owner.headers, listId, {})).rejects.toMatchObject({ status: 404 });
  expect(await restarted.purge()).toMatchObject({ lists: 1, failed: 0 });
  expect((await db.pool.query('select id from kitanda.history_events')).rows).toEqual([]);
  expect((await db.pool.query('select "eventId" from kitanda.history_targets')).rows).toEqual([]);
  await restarted.close();
});
it('repetição após resposta perdida não duplica edição, compra, limpeza ou transição de ciclo', async () => {
  const { owner, listId } = await listFixture(),
    a = await items.create(owner.headers, listId, { name: 'A' }, randomUUID());
  const edit = randomUUID();
  for (let n = 0; n < 2; n++)
    await items.update(
      owner.headers,
      listId,
      a.resourceId,
      { name: 'B', expectedVersion: 1 },
      edit,
    );
  const purchase = randomUUID();
  await Promise.all([
    items.purchased(owner.headers, listId, a.resourceId, true, 2, purchase),
    items.purchased(owner.headers, listId, a.resourceId, true, 2, purchase),
  ]);
  const clear = randomUUID();
  for (let n = 0; n < 2; n++)
    await kitanda.clearPurchased(
      owner.headers,
      listId,
      [{ itemId: a.resourceId, expectedVersion: 3 }],
      clear,
    );
  const remove = randomUUID();
  for (let n = 0; n < 2; n++) await kitanda.remove(owner.headers, listId, 1, remove);
  const restore = randomUUID();
  for (let n = 0; n < 2; n++) await kitanda.restore(owner.headers, listId, 2, restore);
  const events = await all(owner.headers, listId);
  for (const action of [
    'item.updated',
    'item.purchased',
    'items.cleared',
    'list.removed',
    'list.restored',
  ])
    expect(events.filter((e) => e.action === action)).toHaveLength(1);
});
