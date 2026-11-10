import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';
import { openDatabase, migrate } from '../src/database/client.js';
import { createLab } from '../src/lab.js';

test('React → Fastify → PostgreSQL: login, cookie, recuperação e revogação', async ({
  page,
  context,
  baseURL,
}) => {
  const pool = openDatabase(process.env['POC_DATABASE_URL']);
  const lab = createLab({ pool, secret: process.env['POC_AUTH_SECRET']!, baseURL: baseURL! });
  try {
    await migrate(pool);
    const username = 'browser' + randomUUID().replaceAll('-', '').slice(0, 12);
    const user = await lab.createIdentity({
      username,
      password: 'browser-password',
      role: 'global-admin',
    });
    await page.goto('/');
    await page.getByLabel('Usuário').fill(username.toUpperCase());
    await page.getByLabel('Senha', { exact: true }).fill('browser-password');
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page.getByRole('status')).toContainText(username);
    const cookies = await context.cookies();
    const session = cookies.find((c) => c.name.endsWith('session_token'));
    expect(session?.httpOnly).toBe(true);
    expect(session?.sameSite).toBe('Lax');
    expect(session?.secure).toBe(baseURL?.startsWith('https:'));
    const before = await context.request.get('/lab/me');
    expect(before.status()).toBe(200);
    const recovery = await lab.issueRecovery({ kind: 'operator' }, user.id);
    await page.goto('/#recover=' + recovery.token);
    await page.getByLabel('Nova senha').fill('changed-password');
    await page.getByRole('button', { name: 'Definir senha' }).click();
    await expect(page.getByRole('status')).toContainText('Entre novamente');
    expect((await context.request.get('/lab/me')).status()).toBe(401);
    await page.getByLabel('Usuário').fill(username);
    await page.getByLabel('Senha', { exact: true }).fill('changed-password');
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page.getByRole('status')).toContainText(username);
    await page.getByRole('button', { name: 'Sair', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Sessão encerrada');
    expect((await context.request.get('/lab/me')).status()).toBe(401);
  } finally {
    await pool.end();
  }
});
