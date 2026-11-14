import { uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { platformSchema, user } from '../auth/schema.js';
import { cores } from '../contexts/schema.js';
export const invitations = platformSchema.table(
  'invitations',
  {
    id: uuid().primaryKey(),
    coreId: uuid()
      .notNull()
      .references(() => cores.id),
    issuerId: text()
      .notNull()
      .references(() => user.id),
    digest: text().notNull().unique(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    consumedAt: timestamp({ withTimezone: true }),
    revokedAt: timestamp({ withTimezone: true }),
  },
  (t) => [index('invitation_core').on(t.coreId)],
);
