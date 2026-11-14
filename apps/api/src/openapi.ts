import { mkdir, writeFile } from 'node:fs/promises';
import { buildApp } from './app.js';

const app = await buildApp();
try {
  await app.ready();
  const directory = new URL('../../../artifacts/', import.meta.url);
  await mkdir(directory, { recursive: true });
  await writeFile(
    new URL('openapi.json', directory),
    JSON.stringify(app.swagger(), null, 2) + '\n',
  );
} finally {
  await app.close();
}
