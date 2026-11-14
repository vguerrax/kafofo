import { test, expect, type Page } from '@playwright/test';
async function login(
  page: Page,
  username = 'invitations-browser',
  password = 'invitations-password',
) {
  await page.getByLabel('Usuário', { exact: true }).fill(username);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
}
async function issue(page: Page) {
  await page.getByLabel('Nome do núcleo', { exact: true }).fill('Núcleo convidado');
  await page.getByRole('button', { name: 'Criar núcleo', exact: true }).click();
  await expect(
    page.getByText('Núcleo criado. Você é administrador deste núcleo.', { exact: true }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Emitir convite', exact: true }).click();
  return await page.getByLabel('Link do convite — copie agora').inputValue();
}
test('convite no celular e teclado: prévia, cadastro, login e membro sem residência', async ({
  page,
  browser,
}) => {
  await page.goto('/');
  await login(page);
  const link = await issue(page);
  const guest = await browser.newContext({
    viewport: { width: 390, height: 844 },
    ignoreHTTPSErrors: true,
  });
  const p = await guest.newPage();
  await p.goto(link);
  await expect(p.getByRole('heading', { name: 'Convite para Núcleo convidado' })).toBeVisible();
  expect(p.url()).not.toContain('#');
  await p.getByRole('button', { name: 'Criar conta por convite' }).click();
  await p.getByLabel('Novo usuário', { exact: true }).fill('invited-browser');
  await p.getByLabel('Nova senha', { exact: true }).fill('invited-password');
  await p.keyboard.press('Tab');
  await p.keyboard.press('Enter');
  await expect(p.getByText('Conta criada. Entre com sua conta.', { exact: true })).toBeVisible();
  await login(p, 'invited-browser', 'invited-password');
  await expect(p.getByText('Seu papel no núcleo: Membro', { exact: true })).toBeVisible();
  await expect(p.getByLabel('Residência ativa', { exact: true })).toHaveCount(0);
  await p.goto(link);
  await expect(p.getByRole('alert')).toContainText('Convite indisponível');
  await guest.close();
});
test('sessão ativa confirma; participante não consome; recarga orienta reabrir', async ({
  page,
}) => {
  await page.goto('/');
  await login(page);
  const link = await issue(page);
  await page.goto(link);
  await expect(page.getByRole('button', { name: 'Confirmar entrada' })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Reabra o link original para retomar o convite.')).toBeVisible();
  await page.goto(link);
  await page.getByRole('button', { name: 'Confirmar entrada' }).click();
  await expect(
    page.getByText('Você já pertence ao núcleo. O convite continua disponível.', { exact: true }),
  ).toBeVisible();
  await page.goto(link);
  await expect(page.getByRole('button', { name: 'Confirmar entrada' })).toBeVisible();
});
test('conta existente entra pelo login e confirma sem consumir na prévia', async ({
  page,
  browser,
}) => {
  await page.goto('/');
  await login(page);
  const link = await issue(page);
  const guest = await browser.newContext({ ignoreHTTPSErrors: true });
  const p = await guest.newPage();
  await p.goto(link);
  await expect(p.getByRole('heading', { name: 'Convite para Núcleo convidado' })).toBeVisible();
  await login(p, 'existing-browser', 'invitations-password');
  await expect(p.getByRole('button', { name: 'Confirmar entrada' })).toBeVisible();
  await p.getByRole('button', { name: 'Confirmar entrada' }).click();
  await expect(p.getByText('Participação confirmada.', { exact: true })).toBeVisible();
  await guest.close();
});
