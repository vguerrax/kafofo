import { test, expect, type Page } from '@playwright/test';
async function login(page: Page) {
  await page.goto('/');
  await page.getByLabel('Usuário', { exact: true }).fill('kitanda-owner');
  await page.getByLabel('Senha', { exact: true }).fill('kitanda-password');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
}
async function createList(page: Page, name: string) {
  const panel = page.getByRole('region', { name: 'Listas da residência' });
  await panel.getByLabel('Nome da nova lista').fill(name);
  await panel.getByRole('button', { name: 'Criar lista', exact: true }).click();
  await expect(panel.getByRole('heading', { name, exact: true })).toBeVisible();
  return panel;
}
test('itens por teclado no celular, decimais e progresso por contagem', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  const panel = await createList(page, 'Compras com itens'),
    items = panel.getByRole('region', { name: 'Itens da lista' }),
    card = panel.getByRole('article', { name: 'Resumo de Compras com itens' });
  await expect(card).toContainText('Lista vazia');
  for (const [name, quantity] of [
    ['Arroz', '0,5'],
    ['Feijão', '0.5'],
    ['Pão', ''],
  ]) {
    await items.getByLabel('Nome do novo item').fill(name!);
    await items.getByLabel('Quantidade do novo item').fill(quantity!);
    await items.getByRole('button', { name: 'Adicionar item', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(items.getByRole('region', { name: 'Item ' + name, exact: true })).toBeVisible();
    await expect(items.getByRole('button', { name: 'Adicionar item', exact: true })).toBeEnabled();
  }
  await expect(items.getByRole('region', { name: 'Item Arroz', exact: true })).toContainText('0,5');
  await expect(items.getByRole('region', { name: 'Item Feijão', exact: true })).toContainText(
    '0,5',
  );
  await items.getByRole('button', { name: 'Marcar comprado: Arroz', exact: true }).click();
  await expect(card).toContainText('1 de 3 comprados · 33,3%');
  for (const name of ['Feijão', 'Pão'])
    await items.getByRole('button', { name: 'Marcar comprado: ' + name, exact: true }).click();
  await expect(card).toContainText('3 de 3 comprados · 100%');
  await expect(
    items
      .getByRole('region', { name: 'Comprados', exact: true })
      .getByRole('region', { name: 'Item Pão', exact: true }),
  ).toBeVisible();
  await items.getByRole('button', { name: 'Desmarcar: Arroz', exact: true }).click();
  await expect(card).toContainText('2 de 3 comprados · 66,7%');
  await items.getByRole('button', { name: 'Remover Feijão', exact: true }).click();
  await expect(card).toContainText('1 de 2 comprados · 50%');
  const row = items.getByRole('region', { name: 'Item Arroz', exact: true });
  await row.getByRole('button', { name: 'Editar Arroz', exact: true }).click();
  await row.getByLabel('Nome do item', { exact: true }).fill('Arroz integral');
  await row.getByRole('button', { name: 'Salvar item', exact: true }).click();
  await expect(
    items.getByRole('region', { name: 'Item Arroz integral', exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
test('falha preserva preenchimento e visualizador não tem escrita', async ({
  page,
  browser,
  baseURL,
}) => {
  await login(page);
  const panel = await createList(page, 'Lista do visualizador'),
    items = panel.getByRole('region', { name: 'Itens da lista' });
  await page.route('**/api/kitanda/lists/*/items', (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ error: { message: 'Não foi possível salvar.' } }),
        })
      : route.continue(),
  );
  await items.getByLabel('Nome do novo item').fill('Preservado');
  await items.getByRole('button', { name: 'Adicionar item', exact: true }).click();
  await expect(items.getByRole('alert')).toContainText('Não foi possível salvar');
  await expect(items.getByLabel('Nome do novo item')).toHaveValue('Preservado');
  await page.unroute('**/api/kitanda/lists/*/items');
  await items.getByRole('button', { name: 'Adicionar item', exact: true }).click();
  await expect(items.getByRole('region', { name: 'Item Preservado', exact: true })).toBeVisible();
  await panel.getByLabel('Pessoa para compartilhar').selectOption({ label: 'kitanda-member' });
  await panel.getByRole('button', { name: 'Compartilhar lista', exact: true }).click();
  await expect(
    panel.getByRole('button', { name: 'Revogar compartilhamento de kitanda-member' }),
  ).toBeVisible();
  const contexts = (await (await page.request.get('/api/platform/contexts')).json()) as {
    residences: { id: string }[];
  };
  const residence = contexts.residences[0]!.id;
  const accesses = (await (
    await page.request.get('/api/platform/residences/' + residence + '/accesses')
  ).json()) as { userId: string; name: string }[];
  const member = accesses.find((a) => a.name === 'kitanda-member')!;
  expect(
    (
      await page.request.put(
        '/api/platform/residences/' + residence + '/accesses/' + member.userId,
        { headers: { origin: baseURL! }, data: { role: 'viewer' } },
      )
    ).status(),
  ).toBe(204);
  const guest = await browser.newContext({ baseURL: baseURL!, ignoreHTTPSErrors: true }),
    p = await guest.newPage();
  await p.goto('/');
  await p.getByLabel('Usuário', { exact: true }).fill('kitanda-member');
  await p.getByLabel('Senha', { exact: true }).fill('kitanda-password');
  await p.getByRole('button', { name: 'Entrar', exact: true }).click();
  await p.getByRole('button', { name: 'Abrir Lista do visualizador', exact: true }).click();
  const read = p.getByRole('region', { name: 'Itens da lista' });
  await expect(read.getByRole('region', { name: 'Item Preservado', exact: true })).toBeVisible();
  await expect(read.getByRole('button', { name: 'Adicionar item', exact: true })).toHaveCount(0);
  await expect(
    read.getByRole('button', { name: 'Marcar comprado: Preservado', exact: true }),
  ).toHaveCount(0);
  await guest.close();
});
