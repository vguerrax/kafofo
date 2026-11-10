import { test, expect, type APIRequestContext, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type {
  IndividualExport,
  ItemSnapshot,
  ListCard,
} from '../../packages/contracts/dist/index.js';

const config = JSON.parse(readFileSync(process.env['PILOT_CONFIG_FILE']!, 'utf8')) as {
  directory: string;
  candidateRoot: string;
  origin: string;
  commit: string;
  version: string;
};
const directory = config.directory;
const accounts = JSON.parse(readFileSync(resolve(directory, 'accounts.json'), 'utf8')) as Record<
  string,
  string
>;
const rows: {
  scenario: string;
  criteria: string;
  expected: string;
  observed: string;
  result: string;
  at: string;
}[] = [];
const resume = Number(process.env['PILOT_RESUME_FROM'] ?? '1');
const previous =
  resume > 1
    ? (JSON.parse(readFileSync(resolve(directory, 'evidence-browser.json'), 'utf8')) as {
        commit: string;
        rows: typeof rows;
      })
    : null;
type Person = { id: string; username: string };
type Contexts = {
  cores: { id: string; name: string }[];
  residences: { id: string; name: string }[];
};
type Access = { id: string; userId: string; role: string };
type Receipt = { resourceId: string; version: number };

function save(name: string, data: unknown) {
  writeFileSync(resolve(directory, name), JSON.stringify(data, null, 2) + '\n', { mode: 0o600 });
}
async function check(
  scenario: string,
  criteria: string,
  expected: string,
  operation: () => Promise<void>,
) {
  if (Number(scenario.slice(1, 3)) < resume) {
    const prior = previous?.rows.find(
      (row) => row.scenario === scenario && row.result === 'passed',
    );
    if (!prior || previous?.commit !== config.commit)
      throw new Error('Retomada exige evidência aprovada do mesmo candidato.');
    rows.push(prior);
    return;
  }
  await test.step(scenario, async () => {
    try {
      await operation();
      rows.push({
        scenario,
        criteria,
        expected,
        observed: expected,
        result: 'passed',
        at: new Date().toISOString(),
      });
    } catch (error) {
      rows.push({
        scenario,
        criteria,
        expected,
        observed: 'Falha; consultar diagnóstico restrito.',
        result: 'failed',
        at: new Date().toISOString(),
      });
      throw error;
    } finally {
      save('evidence-browser.json', {
        commit: config.commit,
        environment: 'kafofo17-pilot / Caddy HTTPS',
        rows,
      });
    }
  });
}
async function api<T = unknown>(
  client: APIRequestContext,
  path: string,
  options: {
    method?: string;
    data?: unknown;
    status?: number;
    key?: string;
  } = {},
): Promise<T> {
  const response = await client.fetch(path, {
    method: options.method ?? 'GET',
    headers: { origin: config.origin, ...(options.key ? { 'idempotency-key': options.key } : {}) },
    ...(options.data === undefined ? {} : { data: options.data }),
  });
  expect(response.status(), `${options.method ?? 'GET'} ${path}`).toBe(options.status ?? 200);
  return response.status() === 204 ? (undefined as T) : ((await response.json()) as T);
}
async function login(page: Page, username: string) {
  await page.goto('/');
  await page.getByLabel('Usuário', { exact: true }).fill(username);
  await page.getByLabel('Senha', { exact: true }).fill(accounts[username]!);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sair', exact: true })).toBeVisible();
}
async function add(page: Page, name: string) {
  const items = page.getByRole('region', { name: 'Itens da lista', exact: true });
  await items.getByLabel('Nome do novo item').fill(name);
  await items.getByRole('button', { name: 'Adicionar item', exact: true }).click();
  await expect(items.getByRole('region', { name: `Item ${name}`, exact: true })).toBeVisible();
  await expect(items.getByRole('button', { name: 'Adicionar item', exact: true })).toBeEnabled();
}

test('homologação integrada do candidato no Compose privado, com três contas fictícias', async ({
  browser,
  page,
}) => {
  const second = await browser.newContext({
    baseURL: config.origin,
    ignoreHTTPSErrors: true,
    viewport: { width: 390, height: 844 },
  });
  const third = await browser.newContext({ baseURL: config.origin, ignoreHTTPSErrors: true });
  const beto = await second.newPage(),
    caio = await third.newPage();
  const a = page.request,
    b = beto.request,
    c = caio.request;
  let people: Person[] = [],
    coreId = '',
    residenceId = '',
    listId = '',
    removedItemId = '';
  if (resume > 1) {
    const checkpoint = JSON.parse(readFileSync(resolve(directory, 'checkpoint.json'), 'utf8')) as {
      people: Person[];
      coreId: string;
      residenceId: string;
      listId: string;
      removedItemId: string;
    };
    ({ people, coreId, residenceId, listId, removedItemId } = checkpoint);
    await login(page, 'piloto-ana');
    await login(beto, 'piloto-beto');
    await login(caio, 'piloto-caio');
  }
  const snapshot = () => api<ItemSnapshot>(a, `/api/kitanda/lists/${listId}/items`);
  const share = (id: string, accessId: string, revoke = false) =>
    api(a, `/api/kitanda/lists/${id}/shares/${accessId}`, {
      method: revoke ? 'DELETE' : 'PUT',
      ...(revoke ? {} : { data: {} }),
      status: 204,
    });
  const grant = (res: string, user: string, role: string) =>
    api(a, `/api/platform/residences/${res}/accesses/${user}`, {
      method: 'PUT',
      data: { role },
      status: 204,
    });

  await check(
    'H01 — instalação e identidade',
    'CA-P04, CA-P10, CA-P16, contrato Alpha 1',
    'Primeira conta única; três logins; convite não cria núcleo/residência nem concede acesso automaticamente.',
    async () => {
      await page.goto('/');
      await expect(page.getByRole('heading', { name: 'Configurar seu Kafofo' })).toBeFocused();
      await page
        .getByLabel('Código de configuração')
        .fill(readFileSync(resolve(directory, 'setup-code'), 'utf8').trim());
      await page.getByLabel('Usuário', { exact: true }).fill('piloto-ana');
      await page.getByLabel('Senha', { exact: true }).fill(accounts['piloto-ana']!);
      await page.getByRole('button', { name: 'Configurar', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Entrar', exact: true })).toBeVisible();
      await login(page, 'piloto-ana');
      await page.getByLabel('Nome do núcleo', { exact: true }).fill('Núcleo Piloto');
      await page.getByRole('button', { name: 'Criar núcleo', exact: true }).click();
      await expect(page.getByLabel('Núcleo ativo')).toContainText('Núcleo Piloto');
      await page.getByLabel('Nome da residência', { exact: true }).fill('Casa Piloto');
      await page.getByRole('button', { name: 'Criar residência', exact: true }).click();
      await expect(page.getByLabel('Residência ativa')).toContainText('Casa Piloto');
      const contexts = await api<Contexts>(a, '/api/platform/contexts');
      coreId = contexts.cores[0]!.id;
      residenceId = contexts.residences[0]!.id;
      for (const [guest, username] of [
        [beto, 'piloto-beto'],
        [caio, 'piloto-caio'],
      ] as const) {
        await page.getByRole('button', { name: 'Emitir convite', exact: true }).click();
        const link = await page.getByLabel('Link do convite — copie agora').inputValue();
        await guest.goto(link);
        await guest.getByRole('button', { name: 'Criar conta por convite', exact: true }).click();
        await guest.getByLabel('Novo usuário', { exact: true }).fill(username);
        await guest.getByLabel('Nova senha', { exact: true }).fill(accounts[username]!);
        await guest
          .getByRole('button', { name: 'Cadastrar e aceitar convite', exact: true })
          .click();
        await expect(
          guest.getByText('Conta criada. Entre com sua conta.', { exact: true }),
        ).toBeVisible();
        await login(guest, username);
        const own = await api<Contexts>(guest.request, '/api/platform/contexts');
        expect(own.cores).toHaveLength(1);
        expect(own.residences).toEqual([]);
        await api(guest.request, '/api/platform/invitations/preview', {
          method: 'POST',
          data: { token: link.split('#invite=')[1] },
          status: 404,
        });
      }
      // Membership responses expose userId, not the membership ID, as the identity reference.
      const members = await api<{ userId: string; name: string }[]>(
        a,
        `/api/platform/cores/${coreId}/members`,
      );
      people = members.map((m) => ({ id: m.userId, username: m.name }));
      for (const p of people.filter((p) => p.username !== 'piloto-ana'))
        await grant(residenceId, p.id, 'collaborator');
      await api(a, '/api/auth/setup', {
        method: 'POST',
        data: {
          code: 'consumed-code',
          username: 'forbidden-fourth',
          password: accounts['piloto-ana'],
        },
        status: 409,
      });
      for (const guest of [beto, caio]) await guest.reload();
    },
  );
  const owner = people.find((p) => p.username === 'piloto-ana')!,
    member = people.find((p) => p.username === 'piloto-beto')!,
    viewer = people.find((p) => p.username === 'piloto-caio')!;
  const accesses = await api<Access[]>(a, `/api/platform/residences/${residenceId}/accesses`);
  const memberAccess = accesses.find((p) => p.userId === member.id)!,
    viewerAccess = accesses.find((p) => p.userId === viewer.id)!;

  await check(
    'H02 — compra compartilhada',
    'CA-I01, CA-I04, CA-I05, CA-I09, CA-I10, CA-P23',
    'Lista começa privada; duas sessões adicionam/editam/marcam/desmarcam e conferem o resumo; terceira conta recebe 404.',
    async () => {
      await page.getByLabel('Nome da nova lista').fill('Compras integradas');
      await page.getByRole('button', { name: 'Criar lista', exact: true }).click();
      await expect(
        page.getByRole('heading', { name: 'Compras integradas', exact: true }),
      ).toBeVisible();
      const cards = await api<ListCard[]>(a, `/api/kitanda/residences/${residenceId}/lists`);
      listId = cards.find((l) => l.name === 'Compras integradas')!.id;
      for (const path of ['', '/items', '/history'])
        await api(c, `/api/kitanda/lists/${listId}${path}`, { status: 404 });
      await api(c, `/api/kitanda/lists/${listId}/items`, {
        method: 'POST',
        data: { name: 'Indevido' },
        key: crypto.randomUUID(),
        status: 404,
      });
      expect(await api<ListCard[]>(c, `/api/kitanda/residences/${residenceId}/lists`)).toEqual([]);
      await page.getByLabel('Pessoa para compartilhar').selectOption({ label: 'piloto-beto' });
      await page.getByRole('button', { name: 'Compartilhar lista', exact: true }).click();
      await expect(
        page.getByRole('button', { name: 'Revogar compartilhamento de piloto-beto' }),
      ).toBeVisible();
      await beto.reload();
      await beto.getByRole('button', { name: 'Abrir Compras integradas', exact: true }).click();
      await add(page, 'Arroz');
      await add(beto, 'Feijão');
      await page.getByRole('button', { name: 'Atualizar itens', exact: true }).click();
      await expect(page.getByRole('region', { name: 'Item Feijão', exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Marcar comprado: Arroz', exact: true }).click();
      await expect(
        page.getByRole('article', { name: 'Resumo de Compras integradas' }),
      ).toContainText('1 de 2 comprados');
      await page.getByRole('button', { name: 'Desmarcar: Arroz', exact: true }).click();
      await expect(
        page.getByRole('article', { name: 'Resumo de Compras integradas' }),
      ).toContainText('0 de 2 comprados');
    },
  );

  await check(
    'H03 — concorrência e repetição',
    'contrato de versões/idempotência #13; CA-I10',
    'Itens distintos confirmam; mesmo item produz 200/409; resposta perdida repete a mesma chave sem duplicar item.',
    async () => {
      let s = await snapshot();
      const arroz = s.items.find((i) => i.name === 'Arroz')!,
        feijao = s.items.find((i) => i.name === 'Feijão')!;
      const responses = await Promise.all([
        a.patch(`/api/kitanda/lists/${listId}/items/${arroz.id}`, {
          headers: { origin: config.origin, 'idempotency-key': crypto.randomUUID() },
          data: { expectedVersion: arroz.version, quantity: '0.5', unit: 'kg' },
        }),
        b.patch(`/api/kitanda/lists/${listId}/items/${feijao.id}`, {
          headers: { origin: config.origin, 'idempotency-key': crypto.randomUUID() },
          data: { expectedVersion: feijao.version, quantity: '2', unit: 'pacotes' },
        }),
      ]);
      expect(responses.map((r) => r.status())).toEqual([200, 200]);
      s = await snapshot();
      const same = s.items.find((i) => i.id === arroz.id)!;
      const collision = await Promise.all(
        [a, b].map((client, n) =>
          client.patch(`/api/kitanda/lists/${listId}/items/${same.id}`, {
            headers: { origin: config.origin, 'idempotency-key': crypto.randomUUID() },
            data: { expectedVersion: same.version, notes: `Sessão ${n + 1}` },
          }),
        ),
      );
      expect(collision.map((r) => r.status()).sort()).toEqual([200, 409]);
      let dropped = false;
      const attempts: { key: string; body: string | null }[] = [];
      await page.route(`**/api/kitanda/lists/${listId}/items`, async (route) => {
        if (route.request().method() !== 'POST') return route.continue();
        attempts.push({
          key: route.request().headers()['idempotency-key']!,
          body: route.request().postData(),
        });
        const response = await route.fetch();
        if (!dropped) {
          dropped = true;
          return route.abort('failed');
        }
        return route.fulfill({ response });
      });
      const items = page.getByRole('region', { name: 'Itens da lista', exact: true });
      await items.getByLabel('Nome do novo item').fill('Pão confirmado');
      await items.getByRole('button', { name: 'Adicionar item', exact: true }).click();
      await expect(items.getByRole('region', { name: 'Operação sem confirmação' })).toBeVisible();
      await items.getByRole('button', { name: 'Tentar confirmar novamente' }).click();
      await expect(
        items.getByRole('region', { name: 'Item Pão confirmado', exact: true }),
      ).toBeVisible();
      await page.unroute(`**/api/kitanda/lists/${listId}/items`);
      expect(attempts).toHaveLength(2);
      expect(attempts[0]).toEqual(attempts[1]);
      expect((await snapshot()).items.filter((i) => i.name === 'Pão confirmado')).toHaveLength(1);
    },
  );

  await check(
    'H04 — limpeza e lixeira',
    'CA-I11, CA-I15–19; contrato #14',
    'Seleção desatualizada é recusada; limpeza afeta só a seleção; restauração preserva removidos e histórico.',
    async () => {
      let s = await snapshot();
      let item = s.items.find((i) => i.name === 'Arroz')!;
      let changed = await api<Receipt>(
        a,
        `/api/kitanda/lists/${listId}/items/${item.id}/purchased`,
        {
          method: 'PUT',
          data: { purchased: true, expectedVersion: item.version },
          key: crypto.randomUUID(),
        },
      );
      const stale = [{ itemId: item.id, expectedVersion: changed.version }];
      changed = await api<Receipt>(b, `/api/kitanda/lists/${listId}/items/${item.id}/purchased`, {
        method: 'PUT',
        data: { purchased: false, expectedVersion: changed.version },
        key: crypto.randomUUID(),
      });
      await api(a, `/api/kitanda/lists/${listId}/items/clear-purchased`, {
        method: 'POST',
        data: { targets: stale },
        key: crypto.randomUUID(),
        status: 409,
      });
      const bought = await api<Receipt>(
        a,
        `/api/kitanda/lists/${listId}/items/${item.id}/purchased`,
        {
          method: 'PUT',
          data: { purchased: true, expectedVersion: changed.version },
          key: crypto.randomUUID(),
        },
      );
      s = await snapshot();
      item = s.items.find((i) => i.name === 'Feijão')!;
      await api(b, `/api/kitanda/lists/${listId}/items/${item.id}/purchased`, {
        method: 'PUT',
        data: { purchased: true, expectedVersion: item.version },
        key: crypto.randomUUID(),
      });
      removedItemId = bought.resourceId;
      await api(a, `/api/kitanda/lists/${listId}/items/clear-purchased`, {
        method: 'POST',
        data: { targets: [{ itemId: bought.resourceId, expectedVersion: bought.version }] },
        key: crypto.randomUUID(),
      });
      expect((await snapshot()).items.some((i) => i.id === removedItemId)).toBe(false);
      expect((await snapshot()).items.find((i) => i.name === 'Feijão')?.purchased).toBe(true);
      s = await snapshot();
      const deleted = await api<Receipt>(a, `/api/kitanda/lists/${listId}`, {
        method: 'DELETE',
        data: { expectedRevision: s.list.lifecycleRevision },
        key: crypto.randomUUID(),
      });
      await api(b, `/api/kitanda/lists/${listId}/items`, { status: 404 });
      expect(
        (await api<{ events: unknown[] }>(b, `/api/kitanda/lists/${listId}/history`)).events.length,
      ).toBeGreaterThan(0);
      expect(
        (await api<{ id: string }[]>(b, `/api/kitanda/residences/${residenceId}/trash`)).some(
          (l) => l.id === listId,
        ),
      ).toBe(true);
      await api(a, `/api/kitanda/lists/${listId}/restore`, {
        method: 'POST',
        data: { expectedRevision: deleted.version },
        key: crypto.randomUUID(),
      });
      expect((await snapshot()).items.some((i) => i.id === removedItemId)).toBe(false);
      await page.reload();
      await page.getByRole('button', { name: 'Abrir Compras integradas', exact: true }).click();
    },
  );

  await check(
    'H05 — visualizador, revogação e reingresso',
    'CA-P12, CA-P15, CA-P23; CA-I20–24; #19',
    'Visualizador lê sem escrever; revogação remove detalhe, resumo, histórico, lixeira e exportação; reingresso não reativa concessão antiga.',
    async () => {
      await share(listId, viewerAccess.id);
      await api(c, `/api/kitanda/lists/${listId}/items`, {
        method: 'POST',
        data: { name: 'Ação própria de Caio' },
        key: crypto.randomUUID(),
        status: 201,
      });
      await grant(residenceId, viewer.id, 'viewer');
      expect((await api<ItemSnapshot>(c, `/api/kitanda/lists/${listId}/items`)).list.canWrite).toBe(
        false,
      );
      await api(c, `/api/kitanda/lists/${listId}/items`, {
        method: 'POST',
        data: { name: 'Indevido' },
        key: crypto.randomUUID(),
        status: 403,
      });
      const before = await api<IndividualExport>(c, '/api/account/export', {
        method: 'POST',
        data: { password: accounts['piloto-caio'] },
      });
      expect(before.kitandaActions.some((e) => e.listId === listId)).toBe(true);
      const trashed = await api<Receipt>(a, `/api/kitanda/lists/${listId}`, {
        method: 'DELETE',
        data: { expectedRevision: (await snapshot()).list.lifecycleRevision },
        key: crypto.randomUUID(),
      });
      expect(
        (await api<{ id: string }[]>(c, `/api/kitanda/residences/${residenceId}/trash`)).some(
          (l) => l.id === listId,
        ),
      ).toBe(true);
      await api(c, `/api/kitanda/lists/${listId}/restore`, {
        method: 'POST',
        data: { expectedRevision: trashed.version },
        key: crypto.randomUUID(),
        status: 403,
      });
      await api(a, `/api/kitanda/lists/${listId}/restore`, {
        method: 'POST',
        data: { expectedRevision: trashed.version },
        key: crypto.randomUUID(),
      });
      await share(listId, viewerAccess.id, true);
      const hiddenTrash = await api<Receipt>(a, `/api/kitanda/lists/${listId}`, {
        method: 'DELETE',
        data: { expectedRevision: (await snapshot()).list.lifecycleRevision },
        key: crypto.randomUUID(),
      });
      for (const path of ['', '/items', '/history'])
        await api(c, `/api/kitanda/lists/${listId}${path}`, { status: 404 });
      expect(
        (await api<ListCard[]>(c, `/api/kitanda/residences/${residenceId}/lists`)).some(
          (l) => l.id === listId,
        ),
      ).toBe(false);
      expect(
        (await api<{ id: string }[]>(c, `/api/kitanda/residences/${residenceId}/trash`)).some(
          (l) => l.id === listId,
        ),
      ).toBe(false);
      await api(a, `/api/kitanda/lists/${listId}/restore`, {
        method: 'POST',
        data: { expectedRevision: hiddenTrash.version },
        key: crypto.randomUUID(),
      });
      const after = await api<IndividualExport>(c, '/api/account/export', {
        method: 'POST',
        data: { password: accounts['piloto-caio'] },
      });
      expect(after.kitandaActions.some((e) => e.listId === listId)).toBe(false);
      await api(a, `/api/platform/residences/${residenceId}/accesses/${viewer.id}`, {
        method: 'DELETE',
        status: 204,
      });
      expect((await api<Contexts>(c, '/api/platform/contexts')).residences).toEqual([]);
      await grant(residenceId, viewer.id, 'viewer');
      await api(c, `/api/kitanda/lists/${listId}/history`, { status: 404 });
      const current = (
        await api<Access[]>(a, `/api/platform/residences/${residenceId}/accesses`)
      ).find((x) => x.userId === viewer.id)!;
      expect(current.id).not.toBe(viewerAccess.id);
      await share(listId, current.id);
      const privateList = await api<Receipt>(b, `/api/kitanda/residences/${residenceId}/lists`, {
        method: 'POST',
        data: { name: 'Lista privada de Beto' },
        key: crypto.randomUUID(),
        status: 201,
      });
      await api(a, `/api/kitanda/lists/${privateList.resourceId}/history`, { status: 404 });
      expect(
        (await api<ListCard[]>(a, `/api/kitanda/residences/${residenceId}/lists`)).some(
          (l) => l.id === privateList.resourceId,
        ),
      ).toBe(false);
    },
  );

  await check(
    'H06 — recuperação e persistência',
    'CA-P28, CA-P29; instalação #16',
    'Recuperação por administrador invalida sessões; uso único; reinício mantém contas, lista e configuração inicial encerrada.',
    async () => {
      const recovery = await api<{ link: string }>(a, '/api/auth/recovery/issue', {
        method: 'POST',
        data: { username: 'piloto-beto' },
        status: 201,
      });
      const token = recovery.link.split('#recover=')[1]!;
      await api(b, '/api/auth/recovery/complete', {
        method: 'POST',
        data: { token, newPassword: accounts['piloto-beto'] },
        status: 204,
      });
      await api(b, '/api/auth/session', { status: 401 });
      await api(b, '/api/auth/recovery/complete', {
        method: 'POST',
        data: { token, newPassword: accounts['piloto-beto'] },
        status: 404,
      });
      await login(beto, 'piloto-beto');
      const before = (await snapshot()).items.map((i) => i.id).sort();
      execFileSync(
        'python3',
        [
          resolve('deploy/tests/pilot.py'),
          '--candidate-root',
          config.candidateRoot,
          '--private-directory',
          directory,
          'restart',
        ],
        { stdio: 'pipe', timeout: 90000 },
      );
      expect((await api<{ configured: boolean }>(a, '/api/auth/setup')).configured).toBe(true);
      expect((await snapshot()).items.map((i) => i.id).sort()).toEqual(before);
      expect(
        (await api<Contexts>(b, '/api/platform/contexts')).residences.some(
          (r) => r.id === residenceId,
        ),
      ).toBe(true);
    },
  );

  save('checkpoint.json', { people, coreId, residenceId, listId, removedItemId });
  await check(
    'H07 — celular, teclado, foco e erro',
    'CA-P36, CA-P37; compra móvel Alpha 1',
    'Compra concluída a 390 e 360 px sem rolagem horizontal; erro preserva rascunho; foco conferido na ativação por teclado e atritos da tela única medidos.',
    async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.reload();
      await page.getByRole('button', { name: 'Abrir Compras integradas', exact: true }).click();
      const items = page.getByRole('region', { name: 'Itens da lista', exact: true });
      const metrics = await items.evaluate((el) => {
        return {
          viewport: innerHeight,
          itemsTop: Math.round(el.getBoundingClientRect().top + scrollY),
          documentHeight: document.documentElement.scrollHeight,
          width: innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
        };
      });
      expect(metrics.scrollWidth).toBeLessThanOrEqual(390);
      await page.route(`**/api/kitanda/lists/${listId}/items`, (route) =>
        route.request().method() === 'POST'
          ? route.fulfill({
              status: 503,
              contentType: 'application/json',
              body: JSON.stringify({ error: { message: 'Falha simulada de comunicação.' } }),
            })
          : route.continue(),
      );
      const input = items.getByLabel('Nome do novo item');
      await input.fill('Compra móvel');
      await input.press('Tab');
      await items.getByRole('button', { name: 'Adicionar item', exact: true }).focus();
      await page.keyboard.press('Enter');
      await expect(items.getByRole('alert')).toContainText('Falha simulada');
      await expect(input).toHaveValue('Compra móvel');
      await page.unroute(`**/api/kitanda/lists/${listId}/items`);
      await items.getByRole('button', { name: 'Tentar confirmar novamente' }).click();
      await expect(
        items.getByRole('region', { name: 'Item Compra móvel', exact: true }),
      ).toBeVisible();
      const mark = items.getByRole('button', {
        name: 'Marcar comprado: Compra móvel',
        exact: true,
      });
      await expect(mark).toBeEnabled();
      await mark.focus();
      await expect(mark).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(
        items.getByRole('button', { name: 'Desmarcar: Compra móvel', exact: true }),
      ).toBeVisible();
      await items.screenshot({ path: resolve(directory, 'mobile-items-390.png') });
      await page.setViewportSize({ width: 360, height: 740 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        360,
      );
      save('evidence-mobile.json', {
        emulated: true,
        physical: 'pending',
        completed: true,
        metrics,
        screenshots: ['mobile-items-390.png'],
        observations: [
          'A posição vertical da área de compra inclui os controles de contexto da tela única; conferir itemsTop e altura total.',
          'Fluxo emulado concluído; avaliação física permanece independente.',
        ],
      });
    },
  );

  await check(
    'H08 — exportação individual',
    'CA-P35; cinco blocos #19',
    'Senha incorreta não baixa; senha atual entrega JSON v1 próprio sem segredos/conteúdo/atores alheios; recuperação do titular incluída.',
    async () => {
      await api(a, '/api/account/export', {
        method: 'POST',
        data: { password: 'incorrect-password' },
        status: 400,
      });
      const account = page.getByRole('region', { name: 'Conta', exact: true });
      await account.getByRole('button', { name: 'Exportar meus dados', exact: true }).click();
      await account.getByLabel('Senha atual para exportar').fill(accounts['piloto-ana']!);
      const response = page.waitForResponse((r) => r.url().endsWith('/api/account/export'));
      const pending = page.waitForEvent('download');
      await account.getByRole('button', { name: 'Baixar JSON', exact: true }).click();
      const file = await pending;
      const http = await response;
      expect(http.headers()['cache-control']).toBe('no-store');
      expect(http.headers()['content-disposition']).toMatch(/^attachment;/);
      const stream = await file.createReadStream();
      const chunks: Buffer[] = [];
      for await (const part of stream!) chunks.push(Buffer.from(part));
      const text = Buffer.concat(chunks).toString(),
        data = JSON.parse(text) as IndividualExport;
      expect(Object.keys(data).sort()).toEqual([
        'generatedAt',
        'kitandaActions',
        'memberships',
        'profile',
        'schemaVersion',
        'securityEvents',
      ]);
      expect(data.profile.username).toBe('piloto-ana');
      expect(data.schemaVersion).toBe(1);
      for (const forbidden of [
        ...Object.values(accounts),
        member.id,
        viewer.id,
        'piloto-beto',
        'piloto-caio',
        'Feijão',
        'Sessão 1',
        'Sessão 2',
        'session_token',
        'password',
      ])
        expect(text.includes(forbidden)).toBe(false);
      for (const e of data.kitandaActions)
        expect(Object.keys(e).sort()).toEqual(['listId', 'occurredAt', 'type']);
      await file.delete();
      await expect(account.getByLabel('Senha atual para exportar')).toHaveValue('');
      const own = await api<IndividualExport>(b, '/api/account/export', {
        method: 'POST',
        data: { password: accounts['piloto-beto'] },
      });
      expect(
        own.securityEvents.some((e) => e.type === 'recovery.issued' && e.channel === 'admin'),
      ).toBe(true);
      expect(JSON.stringify(own).includes(owner.id)).toBe(false);
    },
  );

  await check(
    'H09 — contextos e dados para recuperação',
    'CA-P03, CA-P12, CA-P23, CA-P39',
    'Segundo contexto permanece isolado; dados representativos e concessões anteriores ao backup preparados por operações normais.',
    async () => {
      const other = await api<{ id: string }>(a, '/api/platform/cores', {
        method: 'POST',
        data: { name: 'Contexto de recuperação' },
        status: 201,
      });
      const homes: string[] = [];
      for (const name of ['Casa arquivo', 'Casa papel'])
        homes.push(
          (
            await api<{ id: string }>(a, `/api/platform/cores/${other.id}/residences`, {
              method: 'POST',
              data: { name, responsibleUserId: owner.id },
              status: 201,
            })
          ).id,
        );
      const isolated = await api<Receipt>(a, `/api/kitanda/residences/${homes[0]}/lists`, {
        method: 'POST',
        data: { name: 'Contexto isolado' },
        key: crypto.randomUUID(),
        status: 201,
      });
      await api(b, `/api/kitanda/lists/${isolated.resourceId}/items`, { status: 404 });
      for (const client of [b, c]) {
        const invite = await api<{ link: string }>(
          a,
          `/api/platform/cores/${other.id}/invitations`,
          { method: 'POST', data: {}, status: 201 },
        );
        await api(client, '/api/platform/invitations/accept', {
          method: 'POST',
          data: { token: invite.link.split('#invite=')[1] },
        });
      }
      await grant(homes[0]!, member.id, 'collaborator');
      await grant(homes[0]!, viewer.id, 'collaborator');
      await grant(homes[1]!, viewer.id, 'collaborator');
      const oldAccess = (
        await api<Access[]>(a, `/api/platform/residences/${homes[0]}/accesses`)
      ).find((x) => x.userId === member.id)!;
      await share(isolated.resourceId, oldAccess.id);
      await api(a, `/api/platform/cores/${other.id}/members/${member.id}`, {
        method: 'DELETE',
        status: 204,
      });
      const rejoin = await api<{ link: string }>(a, `/api/platform/cores/${other.id}/invitations`, {
        method: 'POST',
        data: {},
        status: 201,
      });
      await api(b, '/api/platform/invitations/accept', {
        method: 'POST',
        data: { token: rejoin.link.split('#invite=')[1] },
      });
      expect(
        (await api<Contexts>(b, '/api/platform/contexts')).residences.some(
          (r) => r.id === homes[0],
        ),
      ).toBe(false);
      await grant(homes[0]!, member.id, 'collaborator');
      await api(b, `/api/kitanda/lists/${isolated.resourceId}/history`, { status: 404 });
      const backupShare = await api<Receipt>(a, `/api/kitanda/residences/${residenceId}/lists`, {
        method: 'POST',
        data: { name: 'Concessão anterior ao backup' },
        key: crypto.randomUUID(),
        status: 201,
      });
      await share(backupShare.resourceId, memberAccess.id);
      const expiring = await api<Receipt>(a, `/api/kitanda/residences/${residenceId}/lists`, {
        method: 'POST',
        data: { name: 'Lista para retenção' },
        key: crypto.randomUUID(),
        status: 201,
      });
      await api(a, `/api/kitanda/lists/${expiring.resourceId}/items`, {
        method: 'POST',
        data: { name: 'Conteúdo para expurgo' },
        key: crypto.randomUUID(),
        status: 201,
      });
      await api(a, `/api/kitanda/lists/${expiring.resourceId}`, {
        method: 'DELETE',
        data: { expectedRevision: 1 },
        key: crypto.randomUUID(),
      });
      save('fixture.json', {
        people,
        coreId,
        residenceId,
        listId,
        removedItemId,
        expiredListId: expiring.resourceId,
        backupShareListId: backupShare.resourceId,
        memberAccessId: memberAccess.id,
        revocationCoreId: other.id,
        revokeResidenceId: homes[0],
        downgradeResidenceId: homes[1],
        oldCookies: await page.context().cookies(),
      });
    },
  );
  await second.close();
  await third.close();
});
