import { randomBytes } from 'node:crypto';
import { defineConfig, devices } from '@playwright/test';

const databaseUrl = process.env['CONTEXT_TEST_DATABASE_URL'];
if (!databaseUrl)
  throw new Error('Configure CONTEXT_TEST_DATABASE_URL para o navegador de autenticação.');
const secure = Boolean(process.env['AUTH_TLS_CERT'] && process.env['AUTH_TLS_KEY']);
const baseURL = `${secure ? 'https' : 'http'}://127.0.0.1:5408`;
process.env['AUTH_SECRET'] ??= randomBytes(32).toString('hex');
process.env['AUTH_BASE_URL'] = baseURL;
// Evitar também o snapshot DOM automático de falha, além de traces/imagens/vídeos.
process.env['PLAYWRIGHT_NO_COPY_PROMPT'] = '1';
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'contexts.spec.ts',
  globalSetup: './tests/e2e/contexts-global-setup.ts',
  workers: 1,
  fullyParallel: false,
  forbidOnly: Boolean(process.env['CI']),
  retries: 0,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'off',
    screenshot: 'off',
    video: 'off',
    ignoreHTTPSErrors: secure,
    launchOptions: process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH']
      ? { executablePath: process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH'] }
      : {},
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'pnpm --filter @kafofo/api exec node --import tsx src/server.ts',
      url: 'http://127.0.0.1:4408/api/health',
      reuseExistingServer: false,
      env: {
        HOST: '127.0.0.1',
        PORT: '4408',
        LOG_LEVEL: 'silent',
        DATABASE_URL: databaseUrl,
        AUTH_SECRET: process.env['AUTH_SECRET'],
        AUTH_BASE_URL: baseURL,
      },
    },
    {
      command: 'pnpm --filter @kafofo/web dev --host 127.0.0.1 --port 5408 --strictPort',
      url: baseURL,
      reuseExistingServer: false,
      ignoreHTTPSErrors: secure,
      env: { API_PROXY_TARGET: 'http://127.0.0.1:4408' },
    },
  ],
});
