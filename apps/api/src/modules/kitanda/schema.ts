import { sql } from 'drizzle-orm';
import {
  pgSchema,
  uuid,
  text,
  timestamp,
  unique,
  uniqueIndex,
  foreignKey,
  index,
  numeric,
  boolean,
  check,
} from 'drizzle-orm/pg-core';
import { user, residences, residenceAccesses } from '../platform/public.js';
export const kitandaSchema = pgSchema('kitanda');
export const lists = kitandaSchema.table(
  'lists',
  {
    id: uuid().primaryKey(),
    residenceId: uuid()
      .notNull()
      .references(() => residences.id),
    creatorId: text()
      .notNull()
      .references(() => user.id),
    name: text().notNull(),
    description: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('list_residence_identity').on(t.id, t.residenceId),
    index('list_residence').on(t.residenceId),
  ],
);
export const listShares = kitandaSchema.table(
  'list_shares',
  {
    id: uuid().primaryKey(),
    listId: uuid().notNull(),
    residenceId: uuid().notNull(),
    residenceAccessId: uuid().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    foreignKey({
      columns: [t.listId, t.residenceId],
      foreignColumns: [lists.id, lists.residenceId],
    }),
    foreignKey({
      columns: [t.residenceAccessId, t.residenceId],
      foreignColumns: [residenceAccesses.id, residenceAccesses.residenceId],
    }),
    uniqueIndex('list_share_active')
      .on(t.listId, t.residenceAccessId)
      .where(sql`${t.revokedAt} is null`),
  ],
);

export const items = kitandaSchema.table(
  'items',
  {
    id: uuid().primaryKey(),
    listId: uuid()
      .notNull()
      .references(() => lists.id),
    name: text().notNull(),
    quantity: numeric({ precision: 9, scale: 3 }),
    unit: text(),
    notes: text(),
    purchased: boolean().notNull().default(false),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    index('item_list_active')
      .on(t.listId, t.createdAt, t.id)
      .where(sql`${t.deletedAt} is null`),
    check('item_quantity_range', sql`${t.quantity} > 0 and ${t.quantity} <= 999999.999`),
  ],
);
