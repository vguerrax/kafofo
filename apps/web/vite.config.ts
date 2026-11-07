import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5304,
    strictPort: true,
    ...(process.env['AUTH_TLS_CERT'] && process.env['AUTH_TLS_KEY']
      ? {
          https: {
            cert: readFileSync(process.env['AUTH_TLS_CERT']),
            key: readFileSync(process.env['AUTH_TLS_KEY']),
          },
        }
      : {}),
    proxy: { '/api': process.env['API_PROXY_TARGET'] ?? 'http://127.0.0.1:4304' },
  },
});
