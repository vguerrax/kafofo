import { expect, test } from '@playwright/test';
import type { IndividualExport } from '../../packages/contracts/dist/index.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Usuário', { exact: true }).fill('kitanda-owner');
  await page.getByLabel('Senha', { exact: true }).fill('kitanda-password');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sair', exact: true })).toBeVisible();
});

test('conta confirma senha a cada arquivo e baixa somente o JSON individual, no celular e por teclado', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const account = page.getByRole('region', { name: 'Conta', exact: true });
  await account.getByRole('button', { name: 'Exportar meus dados', exact: true }).focus();
  await page.keyboard.press('Enter');
  const form = account.getByRole('form', { name: 'Exportação individual' });
  await expect(form.getByLabel('Senha atual para exportar')).toBeFocused();
  await form.getByLabel('Senha atual para exportar').fill('kitanda-password');
  const pending = page.waitForEvent('download');
  await form.getByRole('button', { name: 'Baixar JSON', exact: true }).focus();
  await page.keyboard.press('Enter');
  const file = await pending;
  expect(file.suggestedFilename()).toMatch(/^kafofo-dados-\d{4}-\d{2}-\d{2}\.json$/);
  const stream = await file.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const data = JSON.parse(Buffer.concat(chunks).toString()) as IndividualExport;
  expect(Object.keys(data).sort()).toEqual([
    'generatedAt',
    'kitandaActions',
    'memberships',
    'profile',
    'schemaVersion',
    'securityEvents',
  ]);
  expect(data.profile.username).toBe('kitanda-owner');
  expect(data.schemaVersion).toBe(1);
  expect(Array.isArray(data.memberships)).toBe(true);
  expect(JSON.stringify(data)).not.toMatch(
    /kitanda-member|kitanda-password|session_token|password|digest/,
  );
  await file.delete();
  await expect(form.getByLabel('Senha atual para exportar')).toHaveValue('');
  await expect(account.getByRole('status')).toContainText('Download iniciado');
  await form.getByRole('button', { name: 'Baixar JSON', exact: true }).click();
  await expect(form.getByLabel('Senha atual para exportar')).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('senha inválida, limite e falha de geração não iniciam download e apagam a senha', async ({
  page,
}) => {
  const files: string[] = [];
  page.on('download', (file) => files.push(file.suggestedFilename()));
  const account = page.getByRole('region', { name: 'Conta', exact: true });
  await account.getByRole('button', { name: 'Exportar meus dados', exact: true }).click();
  const form = account.getByRole('form', { name: 'Exportação individual' });
  await form.getByLabel('Senha atual para exportar').fill('wrong-password');
  await form.getByRole('button', { name: 'Baixar JSON', exact: true }).click();
  await expect(account.getByRole('alert')).toContainText('Senha atual incorreta');
  await expect(form.getByLabel('Senha atual para exportar')).toHaveValue('');
  for (const status of [429, 503]) {
    await page.route('**/api/account/export', (route) =>
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: status === 429 ? 'EXPORT_BLOCKED' : 'SERVICE_UNAVAILABLE',
            message:
              status === 429
                ? 'Aguarde antes de exportar novamente.'
                : 'Não foi possível gerar o arquivo.',
          },
        }),
      }),
    );
    await form.getByLabel('Senha atual para exportar').fill('kitanda-password');
    await form.getByRole('button', { name: 'Baixar JSON', exact: true }).click();
    await expect(account.getByRole('alert')).toContainText(
      status === 429 ? 'Aguarde' : 'Não foi possível',
    );
    await expect(form.getByLabel('Senha atual para exportar')).toHaveValue('');
    await page.unroute('**/api/account/export');
  }
  expect(files).toEqual([]);
});

test('sessão revogada durante a confirmação encerra o fluxo sem baixar arquivo', async ({
  page,
  baseURL,
}) => {
  const files: string[] = [];
  page.on('download', (file) => files.push(file.suggestedFilename()));
  const account = page.getByRole('region', { name: 'Conta', exact: true });
  await account.getByRole('button', { name: 'Exportar meus dados', exact: true }).click();
  await account.getByLabel('Senha atual para exportar').fill('kitanda-password');
  await page.request.post('/api/auth/logout', { headers: { origin: baseURL! }, data: {} });
  await account.getByRole('button', { name: 'Baixar JSON', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeVisible();
  await expect(
    page.getByText('Sua sessão expirou. Entre novamente.', { exact: true }),
  ).toBeVisible();
  expect(files).toEqual([]);
});
