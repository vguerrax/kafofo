import { pgSchema, text, timestamp, boolean, integer, jsonb, bigint } from 'drizzle-orm/pg-core';
export const namespace = pgSchema('auth_poc');
export const user = namespace.table('user', {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  image: text(),
  createdAt: timestamp({ withTimezone: true }).notNull(),
  updatedAt: timestamp({ withTimezone: true }).notNull(),
  username: text().notNull().unique(),
  displayUsername: text(),
  role: text().notNull().default('member'),
});
export const session = namespace.table('session', {
  id: text().primaryKey(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  token: text().notNull().unique(),
  createdAt: timestamp({ withTimezone: true }).notNull(),
  updatedAt: timestamp({ withTimezone: true }).notNull(),
  ipAddress: text(),
  userAgent: text(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});
export const account = namespace.table('account', {
  id: text().primaryKey(),
  accountId: text().notNull(),
  providerId: text().notNull(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text(),
  refreshToken: text(),
  idToken: text(),
  accessTokenExpiresAt: timestamp({ withTimezone: true }),
  refreshTokenExpiresAt: timestamp({ withTimezone: true }),
  scope: text(),
  password: text(),
  createdAt: timestamp({ withTimezone: true }).notNull(),
  updatedAt: timestamp({ withTimezone: true }).notNull(),
});
export const verification = namespace.table('verification', {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull(),
  updatedAt: timestamp({ withTimezone: true }).notNull(),
});
export const limits = namespace.table('limits', {
  key: text().primaryKey(),
  events: jsonb().$type<number[]>().notNull(),
  blockedUntil: bigint({ mode: 'number' }).notNull().default(0),
});
export const recovery = namespace.table('recovery', {
  digest: text().primaryKey(),
  userId: text()
    .notNull()
    .references(() => user.id),
  expiresAt: bigint({ mode: 'number' }).notNull(),
  failures: integer().notNull().default(0),
  used: boolean().notNull().default(false),
});
export const bootstrap = namespace.table('bootstrap', {
  id: integer().primaryKey(),
  digest: text().notNull(),
  expiresAt: bigint({ mode: 'number' }).notNull(),
  consumed: boolean().notNull().default(false),
});
export const audit = namespace.table('audit', {
  id: text().primaryKey(),
  action: text().notNull(),
  actor: text().notNull(),
  target: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
