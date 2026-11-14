import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
const cert = process.env['POC_TLS_CERT'];
const key = process.env['POC_TLS_KEY'];
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5505,
    strictPort: true,
    ...(cert && key ? { https: { cert: readFileSync(cert), key: readFileSync(key) } } : {}),
    proxy: { '/lab': { target: 'http://127.0.0.1:4505' } },
    headers: { 'Referrer-Policy': 'no-referrer' },
  },
});
