import { randomUUID } from 'node:crypto';
import type pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { username } from 'better-auth/plugins';
import * as schema from './database/schema.js';
import { canonicalUsername, validatePassword } from './policies.js';

export interface AuthOptions {
  secret: string;
  baseURL: string;
  onReset?: (token: string) => void;
}
export function createAuth(client: pg.Pool | pg.PoolClient, options: AuthOptions) {
  return betterAuth({
    secret: options.secret,
    baseURL: options.baseURL,
    trustedOrigins: [options.baseURL],
    logger: { disabled: true },
    telemetry: { enabled: false },
    // Transactions are owned by the laboratory; scoped instances share its PoolClient.
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
      resetPasswordTokenExpiresIn: 1800,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ token }) => {
        options.onReset?.(token);
      },
    },
    session: { expiresIn: 7 * 86400, disableSessionRefresh: true, cookieCache: { enabled: false } },
    rateLimit: { enabled: false },
    user: { additionalFields: { role: { type: 'string', input: false, defaultValue: 'member' } } },
    advanced: {
      ipAddress: { ipAddressHeaders: [] },
      useSecureCookies: options.baseURL.startsWith('https:'),
    },
    plugins: [
      username({
        minUsernameLength: 3,
        maxUsernameLength: 30,
        usernameValidator: (value) => /^[a-zA-Z0-9._-]{3,30}$/.test(value),
      }),
    ],
  });
}
export async function createIdentity(
  client: pg.Pool | pg.PoolClient,
  options: AuthOptions,
  input: { username: string; password: string; role?: 'member' | 'global-admin' | 'core-admin' },
) {
  const username = canonicalUsername(input.username);
  validatePassword(input.password);
  const result = await createAuth(client, options).api.signUpEmail({
    body: {
      username,
      name: input.username,
      email: randomUUID() + '@identity.invalid',
      password: input.password,
    },
  });
  if (input.role)
    await client.query('update auth_poc."user" set role=$1 where id=$2', [
      input.role,
      result.user.id,
    ]);
  return { id: result.user.id, username };
}
