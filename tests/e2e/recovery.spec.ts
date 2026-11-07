import { test, expect, type Page } from '@playwright/test';
async function login(page: Page, username: string, password = 'recovery-password') {
  await page.getByLabel('Usuário', { exact: true }).fill(username);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
}
test('emissão manual e recuperação móvel por teclado revogam sessão e exigem login', async ({
  page,
  browser,
}) => {
  await page.goto('/');
  await login(page, 'recovery-admin');
  await page.getByLabel('Usuário da conta a recuperar').fill('recovery-member');
  await page.getByRole('button', { name: 'Emitir recuperação', exact: true }).click();
  const link = await page.getByLabel('Link de recuperação — copie agora').inputValue();
  const guest = await browser.newContext({
      viewport: { width: 390, height: 844 },
      ignoreHTTPSErrors: true,
    }),
    p = await guest.newPage();
  await p.goto(new URL('/', link).href);
  await login(p, 'recovery-member');
  await expect(p.getByRole('button', { name: 'Sair', exact: true })).toBeVisible();
  await p.goto(link);
  await expect(p.getByLabel('Nova senha de acesso')).toBeVisible();
  expect(p.url()).not.toContain('#');
  await p.reload();
  await expect(p.getByText('Reabra o link original para retomar a recuperação.')).toBeVisible();
  await p.goto(link);
  await p.getByLabel('Nova senha de acesso').fill('replacement-password');
  await p.getByRole('button', { name: 'Definir senha e encerrar sessões' }).focus();
  await p.keyboard.press('Enter');
  await expect(
    p.getByText('Senha redefinida. Entre com a nova senha.', { exact: true }),
  ).toBeVisible();
  expect((await p.request.get('/api/auth/session')).status()).toBe(401);
  await login(p, 'recovery-member', 'replacement-password');
  await expect(p.getByRole('button', { name: 'Sair', exact: true })).toBeVisible();
  await p.goto(link);
  await expect(p.getByRole('alert')).toHaveText('Recuperação indisponível.');
  await guest.close();
});
test('consulta falha permite tentar novamente por teclado', async ({ page }) => {
  await page.goto('/');
  await login(page, 'recovery-admin');
  await page.getByLabel('Usuário da conta a recuperar').fill('recovery-member');
  await page.getByRole('button', { name: 'Emitir recuperação', exact: true }).click();
  const link = await page.getByLabel('Link de recuperação — copie agora').inputValue();
  await page.route('**/api/auth/recovery/preview', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: { message: 'Serviço indisponível.' } }),
    }),
  );
  await page.goto(link);
  await expect(page.getByRole('alert')).toHaveText('Serviço indisponível.');
  await page.unroute('**/api/auth/recovery/preview');
  await page.getByRole('button', { name: 'Verificar link novamente' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Nova senha de acesso')).toBeVisible();
});
