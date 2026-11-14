import { execFileSync } from 'node:child_process';
import { expect, test } from '@playwright/test';
test('núcleo e residência retomam após recarga e gerenciam papéis por teclado', async ({
  page,
  browser,
  baseURL,
}) => {
  await page.goto('/');
  await page.getByLabel('Usuário', { exact: true }).fill('contexts-browser');
  await page.getByLabel('Senha', { exact: true }).fill('contexts-password');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await page.getByLabel('Nome do núcleo').fill('Núcleo de teste');
  await page.getByRole('button', { name: 'Criar núcleo', exact: true }).focus();
  await page.keyboard.press('Enter');
  const cores = (await (await page.request.get('/api/platform/contexts')).json()).cores as {
    id: string;
  }[];
  const coreId = cores[0]!.id;
  execFileSync(
    process.execPath,
    ['--import', 'tsx', 'tests/add-context-browser-members.ts', coreId],
    { cwd: 'apps/api', env: process.env, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  await page.reload();
  await expect(page.getByLabel('Núcleo ativo')).toContainText('Núcleo de teste');
  await page.setViewportSize({ width: 360, height: 740 });
  await page.getByLabel('Nome da residência').fill('Minha residência');
  await page.getByRole('button', { name: 'Criar residência', exact: true }).click();
  await expect(page.getByLabel('Residência ativa')).toContainText('Minha residência');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  await page.reload();
  await expect(page.getByLabel('Residência ativa')).toContainText('Minha residência');
  await page.getByRole('button', { name: 'Atualizar contextos' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Seu papel na residência: Responsável')).toBeVisible();
  await page.getByLabel('Membro para acesso').selectOption({ label: 'housing-member' });
  await page.getByLabel('Papel na residência').selectOption('responsible');
  await page.getByRole('button', { name: 'Aplicar papel na residência' }).click();
  await expect(page.getByRole('status')).toContainText('Papel da residência atualizado');
  const second = await browser.newContext({ baseURL: baseURL!, ignoreHTTPSErrors: true });
  try {
    const other = await second.newPage();
    await other.goto('/');
    await other.getByLabel('Usuário', { exact: true }).fill('housing-member');
    await other.getByLabel('Senha', { exact: true }).fill('contexts-password');
    await other.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(
      other.getByLabel('Papel na residência').locator('option[value="responsible"]'),
    ).toHaveCount(0);
    await other.getByLabel('Membro para acesso').selectOption({ label: 'housing-viewer' });
    await other.getByLabel('Papel na residência').selectOption('viewer');
    await other.getByRole('button', { name: 'Aplicar papel na residência' }).click();
    await expect(other.getByRole('status')).toContainText('Papel da residência atualizado');
    const members = (await (
      await page.request.get('/api/platform/cores/' + coreId + '/members')
    ).json()) as { userId: string; name: string }[];
    const userId = members.find((m) => m.name === 'housing-member')!.userId;
    expect(
      (
        await page.request.delete('/api/platform/cores/' + coreId + '/members/' + userId, {
          headers: { origin: baseURL! },
        })
      ).status(),
    ).toBe(204);
    await other.getByRole('button', { name: 'Atualizar contextos' }).click();
    await expect(other.getByLabel('Residência ativa')).toHaveCount(0);
  } finally {
    await second.close();
  }
  await page.route('**/api/platform/contexts', (r) =>
    r.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: { message: 'Contextos indisponíveis.' } }),
    }),
  );
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('Contextos indisponíveis');
  await page.unroute('**/api/platform/contexts');
  await page.getByRole('button', { name: 'Atualizar contextos' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Residência ativa')).toContainText('Minha residência');
});
