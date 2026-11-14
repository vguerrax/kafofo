import { sql } from 'drizzle-orm';
import {
  pgSchema,
  text,
  timestamp,
  boolean,
  integer,
  bigint,
  jsonb,
  check,
  index,
} from 'drizzle-orm/pg-core';

export const platformSchema = pgSchema('platform');
export const user = platformSchema.table(
  'user',
  {
    id: text().primaryKey(),
    name: text().notNull(),
    email: text().notNull().unique(),
    emailVerified: boolean().notNull().default(false),
    image: text(),
    createdAt: timestamp({ withTimezone: true }).notNull(),
    updatedAt: timestamp({ withTimezone: true }).notNull(),
    username: text().notNull().unique(),
    displayUsername: text(),
    globalAdmin: boolean().notNull().default(false),
  },
  (table) => [check('username_canonical', sql`${table.username} ~ '^[a-z0-9._-]{3,30}$'`)],
);
export const session = platformSchema.table(
  'session',
  {
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
  },
  (table) => [
    index('session_user_idx').on(table.userId),
    index('session_expiry_idx').on(table.expiresAt),
  ],
);
export const account = platformSchema.table(
  'account',
  {
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
  },
  (table) => [index('account_user_idx').on(table.userId)],
);
export const verification = platformSchema.table(
  'verification',
  {
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull(),
    updatedAt: timestamp({ withTimezone: true }).notNull(),
  },
  (table) => [index('verification_expiry_idx').on(table.expiresAt)],
);
export const authSetup = platformSchema.table(
  'auth_setup',
  {
    id: integer().primaryKey(),
    digest: text(),
    expiresAt: timestamp({ withTimezone: true }),
    configured: boolean().notNull().default(false),
  },
  (table) => [check('auth_setup_singleton', sql`${table.id} = 1`)],
);
export const authLimits = platformSchema.table(
  'auth_limits',
  {
    key: text().primaryKey(),
    events: jsonb().$type<number[]>().notNull(),
    blockedUntil: bigint({ mode: 'number' }).notNull().default(0),
    expiresAt: bigint({ mode: 'number' }).notNull(),
  },
  (table) => [index('auth_limits_expiry_idx').on(table.expiresAt)],
);
