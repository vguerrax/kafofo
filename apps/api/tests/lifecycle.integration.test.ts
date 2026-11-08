import { createItemService } from '../src/modules/kitanda/items.js';
import { createKitandaService } from '../src/modules/kitanda/service.js';
import { retentionMaintenance } from '../src/modules/kitanda/retention.js';
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
async function bought(h: Headers, id: string, name = 'Comprado') {
  const row = await items.create(h, id, { name }, randomUUID());
  await items.purchased(h, id, row.resourceId, true, 1, randomUUID());
  return { itemId: row.resourceId, expectedVersion: 2 };
}
it('limpa seleção exata atomicamente e repete comprovante sem alcançar novos comprados', async () => {
  const { owner, member, listId } = await listFixture();
  const a = await bought(owner.headers, listId),
    b = await bought(member.headers, listId, 'Novo');
  const key = randomUUID();
  const receipt = await kitanda.clearPurchased(owner.headers, listId, [a], key);
  expect(receipt).toEqual({ confirmed: true, resourceId: listId });
  expect(await kitanda.clearPurchased(owner.headers, listId, [a], key)).toEqual(receipt);
  expect((await items.collection(owner.headers, listId)).map((r) => r.id)).toEqual([b.itemId]);
  expect(
    (await db.pool.query('select version,"deletedAt" from kitanda.items where id=$1', [a.itemId]))
      .rows[0],
  ).toMatchObject({ version: 3, deletedAt: expect.any(Date) });
  await expect(kitanda.clearPurchased(owner.headers, listId, [b], key)).rejects.toMatchObject({
    status: 409,
    code: 'IDEMPOTENCY_KEY_REUSED',
  });
});
it.each(['edit', 'unmark', 'remove', 'foreign', 'duplicate'] as const)(
  'alvo %s invalida lote inteiro',
  async (change) => {
    const { owner, member, listId, residence } = await listFixture();
    const a = await bought(owner.headers, listId, 'A'),
      b = await bought(owner.headers, listId, 'B');
    let targets = [a, b];
    if (change === 'edit')
      await items.update(
        member.headers,
        listId,
        b.itemId,
        { name: 'Outra sessão', expectedVersion: 2 },
        randomUUID(),
      );
    if (change === 'unmark')
      await items.purchased(member.headers, listId, b.itemId, false, 2, randomUUID());
    if (change === 'remove') await items.remove(member.headers, listId, b.itemId, 2, randomUUID());
    if (change === 'foreign') {
      const other = await kitanda.create(
        owner.headers,
        residence.id,
        { name: 'Outra lista' },
        randomUUID(),
      );
      targets = [a, await bought(owner.headers, other.resourceId)];
    }
    if (change === 'duplicate') targets = [a, a];
    await expect(
      kitanda.clearPurchased(owner.headers, listId, targets, randomUUID()),
    ).rejects.toMatchObject({ status: 409 });
    expect((await items.collection(owner.headers, listId)).some((r) => r.id === a.itemId)).toBe(
      true,
    );
  },
);
it('duas confirmações concorrentes não limpam parcialmente nem duplicam versões', async () => {
  const { owner, member, listId } = await listFixture(),
    a = await bought(owner.headers, listId);
  const results = await Promise.allSettled([
    kitanda.clearPurchased(owner.headers, listId, [a], randomUUID()),
    kitanda.clearPurchased(member.headers, listId, [a], randomUUID()),
  ]);
  expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
  expect(
    (await db.pool.query('select version from kitanda.items where id=$1', [a.itemId])).rows[0]
      .version,
  ).toBe(3);
});
it('lixeira esconde todas as rotas ativas; restauração só recupera itens previamente ativos', async () => {
  const { owner, member, listId, residence } = await listFixture();
  const removed = await bought(owner.headers, listId, 'Removido'),
    active = await bought(owner.headers, listId, 'Ativo');
  await items.remove(owner.headers, listId, removed.itemId, 2, randomUUID());
  const before = (
    await db.pool.query('select "deletedAt" from kitanda.items where id=$1', [removed.itemId])
  ).rows[0];
  const key = randomUUID(),
    deleted = await kitanda.remove(owner.headers, listId, 1, key);
  expect(deleted).toMatchObject({ version: 2 });
  expect(await kitanda.remove(owner.headers, listId, 1, key)).toEqual(deleted);
  expect(await kitanda.collection(owner.headers, residence.id)).toEqual([]);
  for (const op of [
    () => kitanda.detail(owner.headers, listId),
    () => items.collection(owner.headers, listId),
    () => items.create(member.headers, listId, { name: 'Negado' }, randomUUID()),
    () => kitanda.update(owner.headers, listId, { name: 'Negado' }),
    () => kitanda.shares(owner.headers, listId),
    () => kitanda.candidates(owner.headers, listId),
    () => kitanda.share(owner.headers, listId, randomUUID()),
    () => kitanda.revoke(owner.headers, listId, randomUUID()),
    () => kitanda.clearPurchased(owner.headers, listId, [active], randomUUID()),
  ])
    await expect(op()).rejects.toMatchObject({ status: 404 });
  const trash = await kitanda.trash(member.headers, residence.id);
  expect(trash).toHaveLength(1);
  expect(Object.keys(trash[0]!).sort()).toEqual(
    ['canWrite', 'deletedAt', 'id', 'lifecycleRevision', 'name', 'recoverableUntil'].sort(),
  );
  const restoreKey = randomUUID(),
    restored = await kitanda.restore(member.headers, listId, 2, restoreKey);
  expect(restored).toMatchObject({ version: 3 });
  expect(await kitanda.restore(member.headers, listId, 2, restoreKey)).toEqual(restored);
  expect((await items.collection(owner.headers, listId)).map((r) => r.id)).toEqual([active.itemId]);
  expect(
    (await db.pool.query('select "deletedAt" from kitanda.items where id=$1', [removed.itemId]))
      .rows[0],
  ).toEqual(before);
  await expect(kitanda.remove(owner.headers, listId, 1, randomUUID())).rejects.toMatchObject({
    status: 409,
  });
  await kitanda.remove(owner.headers, listId, 3, randomUUID());
  await expect(kitanda.restore(owner.headers, listId, 2, randomUUID())).rejects.toMatchObject({
    status: 409,
  });
});
it('lixeira segue papel/vínculos atuais, não concede acesso ao administrador e não reativa concessões', async () => {
  const { owner, member, viewer, outsider, memberAccess, viewerAccess, listId, residence } =
    await listFixture();
  await kitanda.share(owner.headers, listId, viewerAccess);
  await kitanda.remove(owner.headers, listId, 1, randomUUID());
  expect(await kitanda.trash(viewer.headers, residence.id)).toHaveLength(1);
  await expect(kitanda.restore(viewer.headers, listId, 2, randomUUID())).rejects.toMatchObject({
    status: 403,
  });
  await expect(kitanda.trash(outsider.headers, residence.id)).rejects.toMatchObject({
    status: 404,
  });
  await service.setAccess(owner.headers, residence.id, member.id, 'viewer');
  await expect(kitanda.restore(member.headers, listId, 2, randomUUID())).rejects.toMatchObject({
    status: 403,
  });
  await service.removeAccess(owner.headers, residence.id, member.id);
  await service.setAccess(owner.headers, residence.id, member.id, 'collaborator');
  expect(await kitanda.trash(member.headers, residence.id)).toEqual([]);
  await expect(kitanda.restore(member.headers, listId, 2, randomUUID())).rejects.toMatchObject({
    status: 404,
  });
  await service.setAccess(owner.headers, residence.id, viewer.id, 'collaborator');
  await kitanda.restore(viewer.headers, listId, 2, randomUUID());
  await expect(kitanda.detail(member.headers, listId)).rejects.toMatchObject({ status: 404 });
  expect(
    (
      await db.pool.query('select "revokedAt" from platform.residence_accesses where id=$1', [
        memberAccess,
      ])
    ).rows[0].revokedAt,
  ).not.toBeNull();
  const privateList = await kitanda.create(
    viewer.headers,
    residence.id,
    { name: 'Privada' },
    randomUUID(),
  );
  await kitanda.remove(viewer.headers, privateList.resourceId, 1, randomUUID());
  expect(await kitanda.trash(owner.headers, residence.id)).toEqual([]);
  await expect(
    kitanda.restore(owner.headers, privateList.resourceId, 2, randomUUID()),
  ).rejects.toMatchObject({ status: 404 });
});
async function ageList(id: string, offset: string) {
  await db.pool.query(
    'update kitanda.lists set "deletedAt"=clock_timestamp()-interval \'720 hours\' + $2::interval where id=$1',
    [id, offset],
  );
}
it('recuperação usa prazo do banco: antes pode, no vencimento some e recusa mesmo sem expurgo', async () => {
  const { owner, listId, residence } = await listFixture();
  await kitanda.remove(owner.headers, listId, 1, randomUUID());
  await ageList(listId, '1 second');
  expect(await kitanda.trash(owner.headers, residence.id)).toHaveLength(1);
  await kitanda.restore(owner.headers, listId, 2, randomUUID());
  await kitanda.remove(owner.headers, listId, 3, randomUUID());
  await ageList(listId, '0 seconds');
  expect(await kitanda.trash(owner.headers, residence.id)).toEqual([]);
  await expect(kitanda.restore(owner.headers, listId, 4, randomUUID())).rejects.toMatchObject({
    status: 404,
  });
  expect(
    (await db.pool.query('select id from kitanda.lists where id=$1', [listId])).rows,
  ).toHaveLength(1);
});
it('falha no comprovante reverte limpeza e transições de ciclo', async () => {
  const { owner, listId } = await listFixture(),
    a = await bought(owner.headers, listId);
  await db.pool.query(
    "create or replace function kitanda.lifecycle_fail() returns trigger language plpgsql as $$ begin raise exception 'injected'; end $$",
  );
  await db.pool.query(
    'create trigger lifecycle_fail before insert on kitanda.mutation_receipts for each row execute function kitanda.lifecycle_fail()',
  );
  try {
    await expect(
      kitanda.clearPurchased(owner.headers, listId, [a], randomUUID()),
    ).rejects.toMatchObject({ status: 503 });
    await expect(kitanda.remove(owner.headers, listId, 1, randomUUID())).rejects.toMatchObject({
      status: 503,
    });
  } finally {
    await db.pool.query('drop trigger lifecycle_fail on kitanda.mutation_receipts');
  }
  expect((await kitanda.detail(owner.headers, listId)).lifecycleRevision).toBe(1);
  expect(await items.collection(owner.headers, listId)).toHaveLength(1);
});
it('expurgo individual independe da exclusão da lista e respeita janela', async () => {
  const { owner, listId } = await listFixture(),
    old = await bought(owner.headers, listId),
    recent = await bought(owner.headers, listId);
  for (const a of [old, recent])
    await items.remove(owner.headers, listId, a.itemId, 2, randomUUID());
  await db.pool.query(
    'update kitanda.items set "deletedAt"=clock_timestamp()-interval \'720 hours\' where id=$1',
    [old.itemId],
  );
  await kitanda.remove(owner.headers, listId, 1, randomUUID());
  expect(await kitanda.purge()).toMatchObject({ items: 1, lists: 0, failed: 0 });
  expect(
    (await db.pool.query('select id from kitanda.items order by id')).rows.map((r) => r.id),
  ).toEqual([recent.itemId]);
  expect(await kitanda.purge()).toMatchObject({ items: 0, lists: 0, failed: 0 });
});
it('expurgo de lista vence restauração expirada e remove itens, concessões e comprovantes vinculados', async () => {
  const { owner, member, listId } = await listFixture();
  await bought(owner.headers, listId);
  await kitanda.remove(owner.headers, listId, 1, randomUUID());
  await ageList(listId, '0 seconds');
  const outcomes = await Promise.allSettled([
    kitanda.purge(),
    kitanda.restore(member.headers, listId, 2, randomUUID()),
  ]);
  expect(outcomes[1]).toMatchObject({ status: 'rejected', reason: { status: 404 } });
  expect((await db.pool.query('select id from kitanda.lists')).rows).toEqual([]);
  for (const table of ['items', 'list_shares'])
    expect((await db.pool.query('select id from kitanda.' + table)).rows).toEqual([]);
  expect(
    (
      await db.pool.query(
        'select id from kitanda.mutation_receipts where "parentId"=$1 or "resourceId"=$1',
        [listId],
      )
    ).rows,
  ).toEqual([]);
});
it('duas instâncias e reinício retomam trabalho persistido; falha transacional não perde conteúdo', async () => {
  const { owner, listId } = await listFixture(),
    a = await bought(owner.headers, listId);
  await items.remove(owner.headers, listId, a.itemId, 2, randomUUID());
  await db.pool.query(
    'update kitanda.items set "deletedAt"=clock_timestamp()-interval \'721 hours\' where id=$1',
    [a.itemId],
  );
  await db.pool.query(
    "create or replace function kitanda.purge_fail() returns trigger language plpgsql as $$ begin raise exception 'injected'; end $$",
  );
  await db.pool.query(
    'create trigger purge_fail before delete on kitanda.items for each row execute function kitanda.purge_fail()',
  );
  try {
    expect(await kitanda.purge()).toMatchObject({ failed: 1, items: 0 });
  } finally {
    await db.pool.query('drop trigger purge_fail on kitanda.items');
  }
  expect(
    (await db.pool.query('select name from kitanda.items where id=$1', [a.itemId])).rows,
  ).toHaveLength(1);
  const restarted = createKitandaService(options);
  const counts = await Promise.all([kitanda.purge(), restarted.purge()]);
  expect(counts.reduce((sum, r) => sum + r.items, 0)).toBe(1);
  expect((await db.pool.query('select id from kitanda.items')).rows).toEqual([]);
  await restarted.close();
});
it('HTTP valida seleção/revisão/chave, origem e resposta mínima', async () => {
  const { owner, listId, residence } = await listFixture(),
    a = await bought(owner.headers, listId);
  const headers = {
    cookie: owner.headers.get('cookie')!,
    origin: baseURL,
    'idempotency-key': randomUUID(),
  };
  expect(
    (
      await app.inject({
        method: 'POST',
        url: `/api/kitanda/lists/${listId}/items/clear-purchased`,
        headers,
        payload: { targets: [a] },
      })
    ).json(),
  ).toEqual({ confirmed: true, resourceId: listId });
  expect(
    (
      await app.inject({
        method: 'DELETE',
        url: `/api/kitanda/lists/${listId}`,
        headers,
        payload: { expectedRevision: 1 },
      })
    ).json(),
  ).toMatchObject({ version: 2 });
  const trash = await app.inject({
    method: 'GET',
    url: `/api/kitanda/residences/${residence.id}/trash`,
    headers,
  });
  expect(trash.statusCode).toBe(200);
  expect(trash.headers['cache-control']).toBe('no-store');
  for (const payload of [{}, { expectedRevision: 0 }, { expectedRevision: 2, extra: true }])
    expect(
      (
        await app.inject({
          method: 'POST',
          url: `/api/kitanda/lists/${listId}/restore`,
          headers,
          payload,
        })
      ).statusCode,
    ).toBe(400);
  expect(
    (
      await app.inject({
        method: 'POST',
        url: `/api/kitanda/lists/${listId}/restore`,
        headers: { ...headers, origin: 'https://foreign.invalid' },
        payload: { expectedRevision: 2 },
      })
    ).statusCode,
  ).toBe(403);
  expect(
    (
      await app.inject({
        method: 'POST',
        url: `/api/kitanda/lists/${listId}/restore`,
        headers: { ...headers, 'idempotency-key': 'invalid' },
        payload: { expectedRevision: 2 },
      })
    ).statusCode,
  ).toBe(400);
});

it('papel e revogação também protegem limpeza e repetição de exclusão/restauração', async () => {
  const { owner, member, viewer, viewerAccess, memberAccess, listId, residence } =
      await listFixture(),
    a = await bought(owner.headers, listId);
  await kitanda.share(owner.headers, listId, viewerAccess);
  await expect(
    kitanda.clearPurchased(viewer.headers, listId, [a], randomUUID()),
  ).rejects.toMatchObject({ status: 403 });
  await expect(kitanda.remove(viewer.headers, listId, 1, randomUUID())).rejects.toMatchObject({
    status: 403,
  });
  const key = randomUUID();
  await kitanda.clearPurchased(member.headers, listId, [a], key);
  await kitanda.revoke(owner.headers, listId, memberAccess);
  await expect(kitanda.clearPurchased(member.headers, listId, [a], key)).rejects.toMatchObject({
    status: 404,
  });
  const deletion = randomUUID();
  await kitanda.remove(owner.headers, listId, 1, deletion);
  await service.setAccess(owner.headers, residence.id, owner.id, 'viewer');
  await expect(kitanda.remove(owner.headers, listId, 1, deletion)).rejects.toMatchObject({
    status: 403,
  });
  await service.setAccess(owner.headers, residence.id, owner.id, 'responsible');
  const restoration = randomUUID();
  await kitanda.restore(owner.headers, listId, 2, restoration);
  await service.setAccess(owner.headers, residence.id, owner.id, 'viewer');
  await expect(kitanda.restore(owner.headers, listId, 2, restoration)).rejects.toMatchObject({
    status: 403,
  });
});
it('restauração revalida vencimento depois da espera pelo lock', async () => {
  const { owner, listId } = await listFixture();
  await kitanda.remove(owner.headers, listId, 1, randomUUID());
  const blocker = await db.pool.connect();
  await blocker.query('begin');
  await blocker.query('select pg_advisory_xact_lock(hashtext($1))', ['list:' + listId]);
  const restoring = kitanda.restore(owner.headers, listId, 2, randomUUID());
  const result = restoring.then(
    () => null,
    (e) => e as unknown,
  );
  try {
    for (let attempt = 0; attempt < 50; attempt++) {
      const waiting = (
        await db.pool.query(
          "select count(*)::int total from pg_stat_activity where datname=current_database() and wait_event='advisory'",
        )
      ).rows[0].total;
      if (waiting) break;
      await new Promise((r) => setTimeout(r, 10));
    }
    await blocker.query(
      'update kitanda.lists set "deletedAt"=clock_timestamp()-interval \'720 hours\' where id=$1',
      [listId],
    );
    await blocker.query('commit');
    expect(await result).toMatchObject({ status: 404 });
  } finally {
    await blocker.query('rollback');
    blocker.release();
  }
});
it('lotes limitados preservam candidatos restantes para próxima execução', async () => {
  const { listId } = await listFixture();
  await db.pool.query(
    'insert into kitanda.items(id,"listId",name,"deletedAt") select gen_random_uuid(),$1,\'Vencido\',clock_timestamp()-interval \'721 hours\' from generate_series(1,51)',
    [listId],
  );
  expect(await kitanda.purge()).toMatchObject({ items: 50, failed: 0 });
  expect(await kitanda.purge()).toMatchObject({ items: 1, failed: 0 });
});
it('ponto de integração do histórico compartilha transação e rollback com expurgo', async () => {
  const { owner, listId } = await listFixture(),
    a = await bought(owner.headers, listId);
  await items.remove(owner.headers, listId, a.itemId, 2, randomUUID());
  await db.pool.query(
    'update kitanda.items set "deletedAt"=clock_timestamp()-interval \'721 hours\' where id=$1',
    [a.itemId],
  );
  // Tabela de contrato descartável: não representa o histórico real da #15.
  await db.pool.query(
    'create table kitanda.retention_contract_test("listId" uuid,"itemId" uuid,content text,action text,actor text,moment timestamptz)',
  );
  try {
    await db.pool.query(
      "insert into kitanda.retention_contract_test values($1,$2,'Conteúdo vencido','remove',$3,now())",
      [listId, a.itemId, owner.id],
    );
    const hooks = {
      redactItem: async (c: import('pg').PoolClient, _list: string, id: string) => {
        await c.query('update kitanda.retention_contract_test set content=null where "itemId"=$1', [
          id,
        ]);
      },
      removeList: async (c: import('pg').PoolClient, id: string) => {
        await c.query('delete from kitanda.retention_contract_test where "listId"=$1', [id]);
      },
    };
    const maintenance = retentionMaintenance(options, hooks);
    await db.pool.query(
      "create or replace function kitanda.purge_fail() returns trigger language plpgsql as $$ begin raise exception 'injected'; end $$",
    );
    await db.pool.query(
      'create trigger purge_fail before delete on kitanda.items for each row execute function kitanda.purge_fail()',
    );
    try {
      expect(await maintenance.purge()).toMatchObject({ items: 0, failed: 1 });
    } finally {
      await db.pool.query('drop trigger purge_fail on kitanda.items');
    }
    expect(
      (await db.pool.query('select content from kitanda.retention_contract_test')).rows[0].content,
    ).toBe('Conteúdo vencido');
    expect(await maintenance.purge()).toMatchObject({ items: 1, failed: 0 });
    expect(
      (
        await db.pool.query(
          'select content,action,actor,moment from kitanda.retention_contract_test',
        )
      ).rows[0],
    ).toMatchObject({ content: null, action: 'remove', actor: owner.id, moment: expect.any(Date) });
    await kitanda.remove(owner.headers, listId, 1, randomUUID());
    await ageList(listId, '0 seconds');
    expect(await maintenance.purge()).toMatchObject({ lists: 1, failed: 0 });
    expect((await db.pool.query('select * from kitanda.retention_contract_test')).rows).toEqual([]);
  } finally {
    await db.pool.query('drop table kitanda.retention_contract_test');
  }
});
