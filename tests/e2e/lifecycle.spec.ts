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
test('duas sessões revisam seleção e limpeza não alcança novos comprados', async ({
  page,
  browser,
  baseURL,
}) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 60000));
  await login(page);
  const panel = await createList(page, 'Limpeza compartilhada');
  await add(page, 'Arroz');
  await panel.getByRole('button', { name: 'Marcar comprado: Arroz', exact: true }).click();
  await page.getByLabel('Pessoa para compartilhar').selectOption({ label: 'kitanda-member' });
  await page.getByRole('button', { name: 'Compartilhar lista', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Revogar compartilhamento de kitanda-member' }),
  ).toBeVisible();
  const guest = await browser.newContext({ baseURL: baseURL!, ignoreHTTPSErrors: true }),
    p = await guest.newPage();
  await login(p, 'kitanda-member');
  await p.getByRole('button', { name: 'Abrir Limpeza compartilhada', exact: true }).click();
  await panel.getByRole('button', { name: 'Limpar comprados', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Confirmar limpeza' });
  await expect(dialog).toContainText('Arroz');
  await p.getByRole('button', { name: 'Desmarcar: Arroz', exact: true }).click();
  await expect(
    p.getByRole('button', { name: 'Marcar comprado: Arroz', exact: true }),
  ).toBeVisible();
  await dialog.getByRole('button', { name: 'Confirmar limpeza', exact: true }).click();
  await expect(panel.getByRole('alert')).toContainText('seleção');
  await expect(dialog).toHaveCount(0);
  await expect(panel.getByRole('region', { name: 'Item Arroz', exact: true })).toBeVisible();
  await panel.getByRole('button', { name: 'Marcar comprado: Arroz', exact: true }).click();
  await expect(panel.getByRole('button', { name: 'Desmarcar: Arroz', exact: true })).toBeVisible();
  await panel.getByRole('button', { name: 'Limpar comprados', exact: true }).click();
  await add(p, 'Feijão');
  await p.getByRole('button', { name: 'Marcar comprado: Feijão', exact: true }).click();
  await expect(p.getByRole('button', { name: 'Desmarcar: Feijão', exact: true })).toBeVisible();
  let dropped = false;
  const attempts: { key: string; body: string | null }[] = [];
  await page.route('**/items/clear-purchased', async (route) => {
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
  await dialog.getByRole('button', { name: 'Confirmar limpeza', exact: true }).click();
  await expect(panel.getByRole('region', { name: 'Operação sem confirmação' })).toBeVisible();
  await panel.getByRole('button', { name: 'Tentar confirmar novamente' }).click();
  await expect(panel.getByRole('region', { name: 'Item Arroz', exact: true })).toHaveCount(0);
  await expect(panel.getByRole('region', { name: 'Item Feijão', exact: true })).toBeVisible();
  expect(attempts).toHaveLength(2);
  expect(attempts[0]).toEqual(attempts[1]);
  await guest.close();
});
test('exclusão e restauração por teclado, resposta perdida e novo ciclo', async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 60000));
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  const panel = await createList(page, 'Lista recuperável');
  await add(page, 'Anterior');
  await add(page, 'Ativo');
  await panel.getByRole('button', { name: 'Remover Anterior', exact: true }).click();
  await expect(panel.getByRole('region', { name: 'Item Anterior', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Excluir lista', exact: true }).click();
  let dialog = page.getByRole('dialog', { name: 'Confirmar exclusão da lista' });
  await expect(dialog.getByRole('button', { name: 'Cancelar', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Excluir lista', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Excluir lista', exact: true }).click();
  const attempts: { key: string; body: string | null }[] = [];
  let dropped = false;
  await page.route('**/api/kitanda/lists/*', async (route) => {
    if (route.request().method() !== 'DELETE') return route.continue();
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
  await dialog.getByRole('button', { name: 'Confirmar exclusão', exact: true }).click();
  const pending = page.getByRole('region', { name: 'Operação sem confirmação' });
  await expect(pending).toBeVisible();
  await page.getByRole('button', { name: 'Tentar confirmar novamente' }).click();
  await expect(page.getByRole('region', { name: 'Lista aberta' })).toHaveCount(0);
  expect(attempts).toHaveLength(2);
  expect(attempts[0]).toEqual(attempts[1]);
  expect((await selected(page)).some((r) => r.name === 'Lista recuperável')).toBe(false);
  await page.getByRole('button', { name: 'Abrir lixeira', exact: true }).click();
  const trash = page.getByRole('region', { name: 'Lixeira da residência' });
  await expect(trash).toContainText('Lista recuperável');
  await trash.getByRole('button', { name: 'Restaurar Lista recuperável', exact: true }).click();
  dialog = page.getByRole('dialog', { name: 'Confirmar restauração' });
  await dialog.getByRole('button', { name: 'Confirmar restauração', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(
    trash.getByRole('button', { name: 'Restaurar Lista recuperável', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Abrir Lista recuperável', exact: true }).click();
  await expect(panel.getByRole('region', { name: 'Item Ativo', exact: true })).toBeVisible();
  await expect(panel.getByRole('region', { name: 'Item Anterior', exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
test('visualizador consulta lixeira sem restaurar; revogação retira metadados', async ({
  page,
  browser,
  baseURL,
}) => {
  await login(page);
  await createList(page, 'Lixeira compartilhada');
  await page.getByLabel('Pessoa para compartilhar').selectOption({ label: 'kitanda-member' });
  await page.getByRole('button', { name: 'Compartilhar lista', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Revogar compartilhamento de kitanda-member' }),
  ).toBeVisible();
  const contexts = (await (await page.request.get('/api/platform/contexts')).json()) as {
    residences: { id: string }[];
  };
  const residence = contexts.residences[0]!.id;
  const accesses = (await (
    await page.request.get('/api/platform/residences/' + residence + '/accesses')
  ).json()) as { userId: string; name: string }[];
  const member = accesses.find((a) => a.name === 'kitanda-member')!;
  await page.request.put('/api/platform/residences/' + residence + '/accesses/' + member.userId, {
    headers: { origin: baseURL! },
    data: { role: 'viewer' },
  });
  await page.getByRole('button', { name: 'Excluir lista', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Confirmar exclusão', exact: true })
    .click();
  await expect(page.getByRole('region', { name: 'Lista aberta' })).toHaveCount(0);
  const guest = await browser.newContext({ baseURL: baseURL!, ignoreHTTPSErrors: true }),
    p = await guest.newPage();
  await login(p, 'kitanda-member');
  await p.getByRole('button', { name: 'Abrir lixeira', exact: true }).click();
  const trash = p.getByRole('region', { name: 'Lixeira da residência' });
  await expect(trash).toContainText('Lixeira compartilhada');
  await expect(
    trash.getByRole('button', { name: 'Restaurar Lixeira compartilhada', exact: true }),
  ).toHaveCount(0);
  await page.request.delete(
    '/api/platform/residences/' + residence + '/accesses/' + member.userId,
    { headers: { origin: baseURL! } },
  );
  await trash.getByRole('button', { name: 'Atualizar lixeira', exact: true }).click();
  await expect(trash.getByText('Lixeira compartilhada', { exact: true })).toHaveCount(0);
  await guest.close();
});
