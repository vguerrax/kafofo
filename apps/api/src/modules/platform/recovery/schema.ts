import { uuid, text, timestamp, integer, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { platformSchema, user } from '../auth/schema.js';
export const passwordRecoveries = platformSchema.table(
  'password_recoveries',
  {
    id: uuid().primaryKey(),
    digest: text().notNull().unique(),
    userId: text()
      .notNull()
      .references(() => user.id),
    createdAt: timestamp({ withTimezone: true }).notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    revokedAt: timestamp({ withTimezone: true }),
    consumedAt: timestamp({ withTimezone: true }),
    failures: integer().notNull().default(0),
    channel: text().$type<'admin' | 'operator'>().notNull(),
  },
  (t) => [
    index('recovery_user').on(t.userId),
    check('recovery_failures', sql`${t.failures} between 0 and 5`),
  ],
);
export const recoveryEvents = platformSchema.table(
  'recovery_events',
  {
    id: uuid().primaryKey(),
    action: text().$type<'issued' | 'used'>().notNull(),
    actor: text().notNull(),
    target: text()
      .notNull()
      .references(() => user.id),
    channel: text().$type<'admin' | 'operator'>().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull(),
  },
  (t) => [
    index('recovery_event_target').on(t.target),
    index('recovery_event_expiry').on(t.createdAt),
  ],
);
