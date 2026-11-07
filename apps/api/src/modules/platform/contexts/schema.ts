import { sql } from 'drizzle-orm';
import {
  uuid,
  text,
  timestamp,
  uniqueIndex,
  unique,
  foreignKey,
  check,
  index,
} from 'drizzle-orm/pg-core';
import { platformSchema, user } from '../auth/schema.js';
export const cores = platformSchema.table('cores', {
  id: uuid().primaryKey(),
  name: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
export const coreMemberships = platformSchema.table(
  'core_memberships',
  {
    id: uuid().primaryKey(),
    coreId: uuid()
      .notNull()
      .references(() => cores.id),
    userId: text()
      .notNull()
      .references(() => user.id),
    role: text().$type<'admin' | 'member'>().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    revokedAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    unique('membership_core_identity').on(t.id, t.coreId),
    uniqueIndex('membership_active')
      .on(t.coreId, t.userId)
      .where(sql`${t.revokedAt} is null`),
    index('membership_user').on(t.userId),
    check('membership_role', sql`${t.role} in ('admin','member')`),
  ],
);
export const residences = platformSchema.table(
  'residences',
  {
    id: uuid().primaryKey(),
    coreId: uuid()
      .notNull()
      .references(() => cores.id),
    name: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique('residence_core_identity').on(t.id, t.coreId)],
);
export const residenceAccesses = platformSchema.table(
  'residence_accesses',
  {
    id: uuid().primaryKey(),
    coreId: uuid().notNull(),
    residenceId: uuid().notNull(),
    membershipId: uuid().notNull(),
    role: text().$type<'responsible' | 'collaborator' | 'viewer'>().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    revokedAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    foreignKey({
      columns: [t.membershipId, t.coreId],
      foreignColumns: [coreMemberships.id, coreMemberships.coreId],
    }),
    foreignKey({
      columns: [t.residenceId, t.coreId],
      foreignColumns: [residences.id, residences.coreId],
    }),
    uniqueIndex('residence_access_active')
      .on(t.residenceId, t.membershipId)
      .where(sql`${t.revokedAt} is null`),
    check('residence_access_role', sql`${t.role} in ('responsible','collaborator','viewer')`),
  ],
);
