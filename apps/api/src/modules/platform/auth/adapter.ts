import { randomUUID } from 'node:crypto';
import type pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { username } from 'better-auth/plugins';
import type { AuthConfig } from './config.js';
import * as schema from './schema.js';
import { canonicalUsername, validatePassword } from './policies.js';

// Só recebe PoolClient: APIs mutáveis nunca escapam da transação do serviço.
export function authAdapter(client: pg.PoolClient, options: AuthConfig) {
  return betterAuth({
    secret: options.secret,
    baseURL: options.baseURL,
    trustedOrigins: [options.baseURL],
    logger: { disabled: true },
    telemetry: { enabled: false },
    database: drizzleAdapter(drizzle(client, { schema }), {
      provider: 'pg',
      schema,
      transaction: false,
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: false,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      requireEmailVerification: false,
    },
    session: { expiresIn: 7 * 86400, disableSessionRefresh: true, cookieCache: { enabled: false } },
    rateLimit: { enabled: false },
    user: {
      additionalFields: { globalAdmin: { type: 'boolean', input: false, defaultValue: false } },
    },
    advanced: {
      ipAddress: { ipAddressHeaders: [] },
      useSecureCookies: options.baseURL.startsWith('https:'),
    },
    plugins: [
      username({
        minUsernameLength: 3,
        maxUsernameLength: 30,
        usernameValidator: (value) => /^[A-Za-z0-9._-]{3,30}$/.test(value),
      }),
    ],
  });
}
export async function createIdentity(
  client: pg.PoolClient,
  options: AuthConfig,
  input: { username: string; password: string },
) {
  const username = canonicalUsername(input.username);
  validatePassword(input.password);
  const result = await authAdapter(client, options).api.signUpEmail({
    body: {
      username,
      name: input.username,
      email: randomUUID() + '@identity.invalid',
      password: input.password,
    },
  });
  return { id: result.user.id, username };
}
