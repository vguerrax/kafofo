import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'apps/api/src/**/*.test.ts',
      'apps/web/src/item-feed.test.ts',
      'apps/web/src/export-api.test.ts',
      'packages/*/src/**/*.test.ts',
      'pocs/auth/tests/policies.test.ts',
    ],
    exclude: ['**/*.integration.test.ts'],
  },
});
