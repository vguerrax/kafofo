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
test('histórico por teclado e celular mostra detalhes e permanece disponível na lixeira', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  const items = await createList(page, 'Lista com histórico');
  await add(page, 'Arroz');
  await items.getByRole('button', { name: 'Marcar comprado: Arroz', exact: true }).click();
  await expect(items.getByRole('button', { name: 'Desmarcar: Arroz', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Abrir histórico da lista', exact: true }).focus();
  await page.keyboard.press('Enter');
  const history = page.getByRole('region', { name: 'Histórico da lista' });
  await expect(history).toContainText('Item marcado como comprado');
  await expect(history).toContainText('Arroz');
  await expect(history).toContainText('kitanda-owner');
  await page.getByRole('button', { name: 'Excluir lista', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Confirmar exclusão', exact: true })
    .click();
  await expect(page.getByRole('region', { name: 'Lista aberta' })).toHaveCount(0);
  await expect(page.getByText('Lista enviada à lixeira.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Abrir lixeira', exact: true }).click();
  const trash = page.getByRole('region', { name: 'Lixeira da residência' });
  await trash
    .getByRole('button', { name: 'Ver histórico de Lista com histórico', exact: true })
    .click();
  await expect(trash.getByRole('region', { name: 'Histórico da lista' })).toContainText(
    'Lista excluída',
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
test('visualizador pagina e revogação retira histórico inclusive com cursor antigo', async ({
  page,
  browser,
  baseURL,
}) => {
  await login(page);
  await createList(page, 'Histórico compartilhado');
  const list = (await selected(page)).find((r) => r.name === 'Histórico compartilhado')!;
  for (let n = 0; n < 22; n++)
    expect(
      (
        await page.request.post('/api/kitanda/lists/' + list.id + '/items', {
          headers: { origin: baseURL!, 'idempotency-key': crypto.randomUUID() },
          data: { name: 'Registro ' + n },
        })
      ).status(),
    ).toBe(201);
  await page.getByLabel('Pessoa para compartilhar').selectOption({ label: 'kitanda-member' });
  await page.getByRole('button', { name: 'Compartilhar lista', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Revogar compartilhamento de kitanda-member' }),
  ).toBeVisible();
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
  const guest = await browser.newContext({ baseURL: baseURL!, ignoreHTTPSErrors: true }),
    p = await guest.newPage();
  await p.clock.install();
  await p.clock.pauseAt(new Date(Date.now() + 60000));
  await login(p, 'kitanda-member');
  await p.getByRole('button', { name: 'Abrir Histórico compartilhado', exact: true }).click();
  await p.getByRole('button', { name: 'Abrir histórico da lista', exact: true }).click();
  const history = p.getByRole('region', { name: 'Histórico da lista' });
  await expect(history).toContainText('Registro 21');
  await history.getByRole('button', { name: 'Mais antigos', exact: true }).focus();
  await p.keyboard.press('Enter');
  await expect(
    history.getByRole('heading', { name: 'Histórico de Histórico compartilhado', exact: true }),
  ).toBeFocused();
  await expect(history).toContainText('Lista criada');
  await expect(history).not.toContainText('Registro 21');
  await page.getByRole('button', { name: 'Revogar compartilhamento de kitanda-member' }).click();
  await p.clock.fastForward(5000);
  await expect(history).toHaveCount(0);
  await guest.close();
});
