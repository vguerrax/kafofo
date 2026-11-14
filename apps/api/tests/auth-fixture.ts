import { databaseFixture } from './auth-database-fixture.js';
import { createAuthService } from '../src/modules/platform/auth/service.js';
import { buildApp } from '../src/app.js';
export {
  baseURL,
  secret,
  password,
  origin,
  username,
  testDatabaseUrl,
} from './auth-database-fixture.js';

export async function fixture() {
  const db = await databaseFixture();
  let time = Date.now();
  const options = { ...db.options, now: () => time };
  const auth = createAuthService(options);
  const app = await buildApp({ auth, authOrigin: options.baseURL });
  return {
    ...db,
    auth,
    app,
    options,
    advance: (ms: number) => {
      time += ms;
    },
    setTime: (value: number) => {
      time = value;
    },
    reset: async () => {
      time = Date.now();
      await db.reset();
    },
    close: async () => {
      await app.close();
      await db.close();
    },
  };
}
export function cookie(response: { headers: Record<string, unknown> }) {
  const values = response.headers['set-cookie'];
  return (Array.isArray(values) ? values : [values])
    .filter(Boolean)
    .map((v) => String(v).split(';')[0])
    .join('; ');
}
