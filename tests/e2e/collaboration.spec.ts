import { test, expect, type Page } from '@playwright/test';
async function login(page: Page, username = 'kitanda-owner') {
  await page.goto('/');
  await page.getByLabel('Usuário', { exact: true }).fill(username);
  await page.getByLabel('Senha', { exact: true }).fill('kitanda-password');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
}
async function createList(page: Page, name: string) {
  await page.getByLabel('Nome da nova lista').fill(name);
  await page.getByRole('button', { name: 'Criar lista', exact: true }).click();
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  return page.getByRole('region', { name: 'Itens da lista' });
}
async function add(page: Page, name: string) {
  const panel = page.getByRole('region', { name: 'Itens da lista' });
  await panel.getByLabel('Nome do novo item').fill(name);
  await panel.getByRole('button', { name: 'Adicionar item', exact: true }).click();
  await expect(panel.getByRole('region', { name: 'Item ' + name, exact: true })).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Adicionar item', exact: true })).toBeEnabled();
}
async function selected(page: Page) {
  const contexts = (await (await page.request.get('/api/platform/contexts')).json()) as {
    residences: { id: string }[];
  };
  const cards = (await (
    await page.request.get('/api/kitanda/residences/' + contexts.residences[0]!.id + '/lists')
  ).json()) as { id: string; name: string }[];
  return cards;
}
test('duas sessões preservam rascunho/foco, revisam conflito e removem contexto revogado', async ({
  page,
  browser,
  baseURL,
}) => {
  await login(page);
  await createList(page, 'Lista concorrente');
  await add(page, 'Arroz');
  const list = (await selected(page)).find((l) => l.name === 'Lista concorrente')!;
  await page.getByLabel('Pessoa para compartilhar').selectOption({ label: 'kitanda-member' });
  await page.getByRole('button', { name: 'Compartilhar lista', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Revogar compartilhamento de kitanda-member' }),
  ).toBeVisible();
  const guest = await browser.newContext({ baseURL: baseURL!, ignoreHTTPSErrors: true }),
    p = await guest.newPage();
  await p.clock.install();
  await login(p, 'kitanda-member');
  await p.getByRole('button', { name: 'Abrir Lista concorrente', exact: true }).click();
  const items = p.getByRole('region', { name: 'Itens da lista' });
  await items.getByRole('button', { name: 'Editar Arroz', exact: true }).click();
  const editor = items.getByRole('region', { name: 'Edição do item' }),
    field = editor.getByLabel('Nome do item', { exact: true });
  await field.fill('Meu rascunho');
  const snapshot = (await (
    await page.request.get('/api/kitanda/lists/' + list.id + '/items')
  ).json()) as { items: { id: string; version: number }[] };
  const row = snapshot.items[0]!;
  expect(
    (
      await page.request.patch('/api/kitanda/lists/' + list.id + '/items/' + row.id, {
        headers: { origin: baseURL!, 'idempotency-key': crypto.randomUUID() },
        data: { name: 'Outra sessão', expectedVersion: row.version },
      })
    ).status(),
  ).toBe(200);
  await p.clock.fastForward(5000);
  await expect(editor.getByRole('region', { name: 'Versão atual do item' })).toBeVisible();
  await expect(field).toHaveValue('Meu rascunho');
  await expect(field).toBeFocused();
  await expect(editor.getByRole('button', { name: 'Salvar item', exact: true })).toBeDisabled();
  await editor.getByRole('button', { name: 'Usar versão atual após revisão' }).click();
  await editor.getByRole('button', { name: 'Salvar item', exact: true }).click();
  await expect(items.getByRole('region', { name: 'Item Meu rascunho', exact: true })).toBeVisible();
  await items.getByRole('button', { name: 'Editar Meu rascunho', exact: true }).click();
  await field.fill('Conflito preservado');
  const latest = (await (
    await page.request.get('/api/kitanda/lists/' + list.id + '/items')
  ).json()) as typeof snapshot;
  await page.request.patch('/api/kitanda/lists/' + list.id + '/items/' + row.id, {
    headers: { origin: baseURL!, 'idempotency-key': crypto.randomUUID() },
    data: { name: 'Mais recente', expectedVersion: latest.items[0]!.version },
  });
  await field.press('Enter');
  await expect(items.getByRole('alert')).toContainText('O item mudou');
  await expect(field).toHaveValue('Conflito preservado');
  await expect(editor.getByRole('region', { name: 'Versão atual do item' })).toContainText(
    'Mais recente',
  );
  const contexts = (await (await page.request.get('/api/platform/contexts')).json()) as {
    residences: { id: string }[];
  };
  const accesses = (await (
    await page.request.get('/api/platform/residences/' + contexts.residences[0]!.id + '/accesses')
  ).json()) as { userId: string; name: string }[];
  await page.request.put(
    '/api/platform/residences/' +
      contexts.residences[0]!.id +
      '/accesses/' +
      accesses.find((a) => a.name === 'kitanda-member')!.userId,
    { headers: { origin: baseURL! }, data: { role: 'viewer' } },
  );
  await p.clock.fastForward(5000);
  await expect(field).toBeDisabled();
  await expect(p.getByLabel('Nome da nova lista')).toHaveCount(0);
  await expect(items).toBeVisible();
  await page.getByRole('button', { name: 'Revogar compartilhamento de kitanda-member' }).click();
  await p.clock.fastForward(5000);
  await expect(items).toHaveCount(0);
  await expect(p.getByText('Conflito preservado', { exact: true })).toHaveCount(0);
  await p.clock.fastForward(15000);
  await expect(p.getByRole('heading', { name: 'Mais recente', exact: true })).toHaveCount(0);
  await guest.close();
});
test('cadência pausa oculta e falha de consulta preserva formulário e foco', async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 60000));
  await login(page);
  const items = await createList(page, 'Cadência');
  await add(page, 'Item');
  await items.getByRole('button', { name: 'Editar Item', exact: true }).click();
  const field = items
    .getByRole('region', { name: 'Edição do item' })
    .getByLabel('Nome do item', { exact: true });
  await field.fill('Ainda digitando');
  let reads = 0;
  page.on('request', (r) => {
    if (r.method() === 'GET' && /\/lists\/[^/]+\/items$/.test(r.url())) reads++;
  });
  await page.clock.fastForward(4999);
  expect(reads).toBe(0);
  await page.clock.fastForward(1);
  await expect.poll(() => reads).toBe(1);
  await expect(field).toHaveValue('Ainda digitando');
  await expect(field).toBeFocused();
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.fastForward(15000);
  expect(reads).toBe(1);
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(() => reads).toBe(2);
  await page.route('**/api/kitanda/lists/*/items', (r) =>
    r.request().method() === 'GET'
      ? r.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ error: { message: 'indisponível' } }),
        })
      : r.continue(),
  );
  await items.getByRole('button', { name: 'Atualizar itens', exact: true }).click();
  await expect(items.getByRole('status')).toContainText('desatualizados');
  await expect(field).toHaveValue('Ainda digitando');
  await expect(items.getByRole('button', { name: 'Atualizar itens', exact: true })).toBeFocused();
  await page.unroute('**/api/kitanda/lists/*/items');
});
test('resposta perdida após commit repete lista e item com payload e chave iguais', async ({
  page,
}) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 60000));
  await login(page);
  let listDropped = false;
  const listRequests: { key: string; payload: string | null }[] = [];
  await page.route('**/api/kitanda/residences/*/lists', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    listRequests.push({
      key: route.request().headers()['idempotency-key']!,
      payload: route.request().postData(),
    });
    const response = await route.fetch();
    if (!listDropped) {
      listDropped = true;
      return route.abort('failed');
    }
    return route.fulfill({ response });
  });
  await page.getByLabel('Nome da nova lista').fill('Criação sem resposta');
  await page.getByRole('button', { name: 'Criar lista', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Operação sem confirmação' })).toBeVisible();
  await expect(page.getByLabel('Nome da nova lista')).toHaveValue('Criação sem resposta');
  await expect(page.getByLabel('Nome da nova lista')).toBeDisabled();
  await page.getByRole('button', { name: 'Tentar confirmar novamente' }).click();
  await expect(
    page.getByRole('heading', { name: 'Criação sem resposta', exact: true }),
  ).toBeVisible();
  expect(listRequests).toHaveLength(2);
  expect(listRequests[0]).toEqual(listRequests[1]);
  expect((await selected(page)).filter((l) => l.name === 'Criação sem resposta')).toHaveLength(1);
  let dropped = false;
  const attempts: typeof listRequests = [];
  await page.route('**/api/kitanda/lists/*/items', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    attempts.push({
      key: route.request().headers()['idempotency-key']!,
      payload: route.request().postData(),
    });
    const response = await route.fetch();
    if (!dropped) {
      dropped = true;
      return route.abort('failed');
    }
    return route.fulfill({ response });
  });
  const items = page.getByRole('region', { name: 'Itens da lista' });
  await items.getByLabel('Nome do novo item').fill('Confirmar uma vez');
  await items.getByRole('button', { name: 'Adicionar item', exact: true }).click();
  await expect(items.getByRole('region', { name: 'Operação sem confirmação' })).toBeVisible();
  await expect(items.getByLabel('Nome do novo item')).toHaveValue('Confirmar uma vez');
  const ownContexts = (await (await page.request.get('/api/platform/contexts')).json()) as {
    residences: { id: string }[];
  };
  const ownSession = (await (await page.request.get('/api/auth/session')).json()) as {
    user: { id: string };
  };
  const ownAccess =
    '/api/platform/residences/' + ownContexts.residences[0]!.id + '/accesses/' + ownSession.user.id;
  await page.request.put(ownAccess, {
    headers: { origin: new URL(page.url()).origin },
    data: { role: 'viewer' },
  });
  await items.getByRole('button', { name: 'Tentar confirmar novamente' }).click();
  await expect(items.getByRole('region', { name: 'Operação sem confirmação' })).toBeVisible();
  await expect(items.getByRole('button', { name: 'Tentar confirmar novamente' })).toBeDisabled();
  await page.request.put(ownAccess, {
    headers: { origin: new URL(page.url()).origin },
    data: { role: 'responsible' },
  });
  await items.getByRole('button', { name: 'Atualizar itens', exact: true }).click();
  await expect(items.getByRole('button', { name: 'Tentar confirmar novamente' })).toBeEnabled();
  await items.getByRole('button', { name: 'Tentar confirmar novamente' }).click();
  await expect(
    items.getByRole('region', { name: 'Item Confirmar uma vez', exact: true }),
  ).toHaveCount(1);
  expect(attempts).toHaveLength(3);
  expect(attempts[0]).toEqual(attempts[1]);
  expect(attempts[0]).toEqual(attempts[2]);
  await items.getByRole('button', { name: 'Editar Confirmar uma vez', exact: true }).click();
  const edit = items.getByRole('region', { name: 'Edição do item' });
  await edit.getByLabel('Nome do item', { exact: true }).fill('Não sobrescrever removido');
  const list = (await selected(page)).find((l) => l.name === 'Criação sem resposta')!;
  const snapshot = (await (
    await page.request.get('/api/kitanda/lists/' + list.id + '/items')
  ).json()) as { items: { id: string; version: number }[] };
  expect(
    (
      await page.request.delete(
        '/api/kitanda/lists/' + list.id + '/items/' + snapshot.items[0]!.id,
        {
          headers: { origin: new URL(page.url()).origin, 'idempotency-key': crypto.randomUUID() },
          data: { expectedVersion: snapshot.items[0]!.version },
        },
      )
    ).status(),
  ).toBe(204);
  await edit.getByLabel('Nome do item', { exact: true }).press('Enter');
  await expect(edit.getByRole('alert')).toContainText('Item indisponível');
  await expect(edit.getByRole('button', { name: 'Salvar item', exact: true })).toBeDisabled();
  await expect(items).toBeVisible();
});
test('fora da janela não repete e exige conferência antes de nova operação', async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 60000));
  await login(page);
  const items = await createList(page, 'Prazo de confirmação');
  let attempts = 0;
  await page.route('**/api/kitanda/lists/*/items', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    attempts++;
    const response = await route.fetch();
    if (attempts === 1) return route.abort('failed');
    return route.fulfill({ response });
  });
  await items.getByLabel('Nome do novo item').fill('Uma vez');
  await items.getByRole('button', { name: 'Adicionar item', exact: true }).click();
  await expect(items.getByRole('region', { name: 'Operação sem confirmação' })).toBeVisible();
  await page.clock.fastForward(86400000);
  await items.getByRole('button', { name: 'Tentar confirmar novamente' }).click();
  await expect(items.getByText('A janela de 24 horas terminou.', { exact: false })).toBeVisible();
  expect(attempts).toBe(1);
  await expect(items.getByLabel('Nome do novo item')).toBeDisabled();
  await items.getByRole('button', { name: 'Atualizar para conferir' }).click();
  await items.getByRole('button', { name: 'Conferi o resultado; liberar nova operação' }).click();
  await expect(items.getByLabel('Nome do novo item')).toBeEnabled();
  await items.getByLabel('Nome do novo item').fill('Nova intenção');
  await items.getByRole('button', { name: 'Adicionar item', exact: true }).click();
  await expect(
    items.getByRole('region', { name: 'Item Nova intenção', exact: true }),
  ).toBeVisible();
  expect(attempts).toBe(2);
});
