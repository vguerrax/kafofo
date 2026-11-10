import { loadEnvFile } from 'node:process';
import { defineConfig } from 'drizzle-kit';

try {
  loadEnvFile('.env');
} catch (error) {
  if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error;
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/database/schema.ts',
  out: './drizzle',
  strict: true,
  verbose: false,
  ...(process.env['DATABASE_URL'] ? { dbCredentials: { url: process.env['DATABASE_URL'] } } : {}),
});
