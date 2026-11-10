import { defineConfig, devices } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const file = process.env['PILOT_CONFIG_FILE'];
if (!file) throw new Error('Configure PILOT_CONFIG_FILE para o piloto privado dedicado.');
const config = JSON.parse(readFileSync(file, 'utf8')) as {
  origin: string;
  project: string;
  directory: string;
};
if (config.project !== 'kafofo17-pilot' || !config.origin.startsWith('https://'))
  throw new Error('O roteiro exige o projeto HTTPS dedicado da #17.');
process.env['PLAYWRIGHT_NO_COPY_PROMPT'] = '1';
export default defineConfig({
  testDir: './tests/pilot',
  outputDir: resolve(config.directory, 'playwright-results'),
  workers: 1,
  retries: 0,
  timeout: 240000,
  reporter: 'list',
  use: {
    baseURL: config.origin,
    actionTimeout: 15000,
    navigationTimeout: 30000,
    // TLS chain/name are independently checked with the explicitly trusted Caddy CA.
    // No CA is installed globally in the operator's browsers by this runner.
    ignoreHTTPSErrors: true,
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
