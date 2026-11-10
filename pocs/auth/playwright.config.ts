import { defineConfig } from '@playwright/test';
const secure = Boolean(process.env['POC_TLS_CERT'] && process.env['POC_TLS_KEY']);
const origin = `${secure ? 'https' : 'http'}://127.0.0.1:5505`;
export default defineConfig({
  testDir: './tests',
  testMatch: 'browser.spec.ts',
  workers: 1,
  retries: 0,
  use: {
    baseURL: origin,
    ignoreHTTPSErrors: true,
    trace: 'off',
    screenshot: 'off',
    video: 'off',
    launchOptions: process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH']
      ? { executablePath: process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH'] }
      : {},
  },
  webServer: [
    {
      command: 'pnpm serve',
      url: 'http://127.0.0.1:4505/lab/health',
      reuseExistingServer: false,
      env: { POC_ORIGIN: origin },
    },
    { command: 'pnpm client', url: origin, ignoreHTTPSErrors: true, reuseExistingServer: false },
  ],
});
