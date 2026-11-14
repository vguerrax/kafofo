import { expect, test } from '@playwright/test';

test('interface se conecta à API e cabe em um celular', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Kafofo', exact: true })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('Servidor disponível.');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});

test('falha de conexão permite tentar novamente por teclado', async ({ page }) => {
  await page.route('**/api/health', (route) => route.abort());
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('Não foi possível conectar');
  await page.unroute('**/api/health');
  await page.getByRole('button', { name: 'Tentar novamente' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toHaveText('Servidor disponível.');
});
