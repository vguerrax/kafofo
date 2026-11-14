import { test, expect, type Page } from '@playwright/test';
async function login(page: Page, username: string) {
  await page.goto('/');
  await page.getByLabel('Usuário', { exact: true }).fill(username);
  await page.getByLabel('Senha', { exact: true }).fill('kitanda-password');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Listas da residência' })).toBeVisible();
}
test('lista privada e compartilhamento entre duas sessões com revogação', async ({
  page,
  browser,
  baseURL,
}) => {
  await login(page, 'kitanda-owner');
  const panel = page.getByRole('region', { name: 'Listas da residência' });
  await panel.getByLabel('Nome da nova lista').fill('Compras semanais');
  await panel.getByLabel('Descrição da nova lista').fill('Para a casa');
  await panel.getByRole('button', { name: 'Criar lista', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(panel.getByRole('heading', { name: 'Compras semanais', exact: true })).toBeVisible();
  const guest = await browser.newContext({
      viewport: { width: 390, height: 844 },
      ignoreHTTPSErrors: true,
    }),
    other = await guest.newPage();
  await other.goto(baseURL!);
  await login(other, 'kitanda-member');
  const otherPanel = other.getByRole('region', { name: 'Listas da residência' });
  await expect(otherPanel.getByText('Nenhuma lista acessível nesta residência.')).toBeVisible();
  await panel.getByLabel('Pessoa para compartilhar').selectOption({ label: 'kitanda-member' });
  await panel.getByRole('button', { name: 'Compartilhar lista', exact: true }).click();
  await expect(
    panel.getByRole('button', { name: 'Revogar compartilhamento de kitanda-member' }),
  ).toBeVisible();
  await other.evaluate(() => window.dispatchEvent(new Event('focus')));
  await otherPanel.getByRole('button', { name: 'Abrir Compras semanais', exact: true }).click();
  await otherPanel.getByLabel('Nome da lista', { exact: true }).fill('Compras atualizadas');
  await otherPanel.getByRole('button', { name: 'Salvar lista', exact: true }).click();
  await expect(
    otherPanel.getByRole('heading', { name: 'Compras atualizadas', exact: true }),
  ).toBeVisible();
  await expect(otherPanel.getByLabel('Pessoa para compartilhar')).toHaveCount(0);
  expect(await other.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await panel.getByRole('button', { name: 'Revogar compartilhamento de kitanda-member' }).click();
  await other.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(
    otherPanel.getByRole('heading', { name: 'Compras atualizadas', exact: true }),
  ).toHaveCount(0);
  await expect(
    otherPanel.getByRole('button', { name: 'Abrir Compras atualizadas', exact: true }),
  ).toHaveCount(0);
  await guest.close();
});
test('erro de consulta permite retomar por teclado', async ({ page }) => {
  await page.route('**/api/kitanda/residences/*/lists', (r) =>
    r.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: { message: 'Listas indisponíveis.' } }),
    }),
  );
  await login(page, 'kitanda-owner');
  const panel = page.getByRole('region', { name: 'Listas da residência' });
  await expect(panel.getByRole('alert')).toHaveText('Listas indisponíveis.');
  await page.unroute('**/api/kitanda/residences/*/lists');
  await panel.getByRole('button', { name: 'Atualizar listas', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(panel.getByRole('alert')).toHaveCount(0);
});
