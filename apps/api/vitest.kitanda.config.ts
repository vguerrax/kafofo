import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: [
      'tests/kitanda.integration.test.ts',
      'tests/items.integration.test.ts',
      'tests/collaboration.integration.test.ts',
      'tests/lifecycle.integration.test.ts',
      'tests/history.integration.test.ts',
      'tests/security-audit.integration.test.ts',
    ],
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
