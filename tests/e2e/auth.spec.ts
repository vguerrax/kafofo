import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';

test('configuração, login obrigatório, troca e bloqueio persistido entre navegadores', async ({
  page,
  browser,
  context,
  baseURL,
}) => {
  const username = 'browser' + randomUUID().replaceAll('-', '').slice(0, 12);
  const code = execFileSync(
    process.execPath,
    ['--import', 'tsx', 'src/modules/platform/auth/operator.ts'],
    {
      cwd: 'apps/api',
      env: {
        ...process.env,
        DATABASE_URL: process.env['AUTH_TEST_DATABASE_URL'],
        AUTH_BASE_URL: baseURL,
      },
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  ).trim();
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Configurar seu Kafofo' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Código de configuração')).toBeFocused();
  await page.getByLabel('Código de configuração').fill(code);
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Usuário', { exact: true })).toBeFocused();
  await page.getByLabel('Usuário', { exact: true }).fill(username);
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Senha', { exact: true })).toBeFocused();
  await page.getByLabel('Senha', { exact: true }).fill('browser-password');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Configurar', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Entrar', exact: true })).toBeVisible();
  expect((await context.request.get('/api/auth/session')).status()).toBe(401);
  const signIn = async (pass: string) => {
    await page.getByLabel('Usuário', { exact: true }).fill(username);
    await page.getByLabel('Senha', { exact: true }).fill(pass);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Sua casa começa aqui.')).toBeVisible();
  };
  await signIn('browser-password');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  const session = (await context.cookies()).find((value) => value.name.endsWith('session_token'));
  expect(session?.httpOnly).toBe(true);
  expect(session?.sameSite).toBe('Lax');
  expect(session?.secure).toBe(baseURL?.startsWith('https:'));
  const second = await browser.newContext({ baseURL: baseURL!, ignoreHTTPSErrors: true });
  try {
    expect(
      (
        await second.request.post('/api/auth/login', {
          headers: { origin: baseURL! },
          data: { username, password: 'browser-password' },
        })
      ).status(),
    ).toBe(200);
    await page.getByLabel('Senha atual').fill('browser-password');
    await page.getByLabel('Nova senha').fill('browser-changed');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Trocar senha', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('status')).toContainText('Senha alterada');
    expect((await second.request.get('/api/auth/session')).status()).toBe(401);
    for (let i = 0; i < 5; i++) {
      await page.getByLabel('Senha atual').fill('wrong-password');
      await page.getByLabel('Nova senha').fill('browser-new-password');
      await page.getByRole('button', { name: 'Trocar senha', exact: true }).click();
      if (i < 4) await expect(page.getByRole('alert')).toContainText('Senha atual incorreta');
    }
    await expect(page.getByRole('heading', { name: 'Entrar', exact: true })).toBeVisible();
    await signIn('browser-changed');
    await page.getByLabel('Senha atual').fill('browser-changed');
    await page.getByLabel('Nova senha').fill('browser-new-password');
    await page.getByRole('button', { name: 'Trocar senha', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('15 minutos');
    await page.getByRole('button', { name: 'Sair', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Entrar', exact: true })).toBeVisible();
    expect((await context.request.get('/api/auth/session')).status()).toBe(401);
  } finally {
    await second.close();
  }
});

test('falha de acesso permite tentar novamente por teclado', async ({ page }) => {
  await page.route('**/api/auth/setup', (route) => route.abort());
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('Não foi possível conectar');
  await page.unroute('**/api/auth/setup');
  await page.getByRole('button', { name: 'Tentar novamente' }).focus();
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('heading', { name: /^(Entrar|Configurar seu Kafofo)$/ }),
  ).toBeVisible();
});
