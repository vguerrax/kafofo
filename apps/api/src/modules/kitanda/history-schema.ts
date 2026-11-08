import { jsonb, uuid, text, timestamp, index, primaryKey } from 'drizzle-orm/pg-core';
import type { HistoryAction, HistoryDetails, HistoryTargetDetails } from '@kafofo/contracts';
import { sql } from 'drizzle-orm';
import { user } from '../platform/public.js';
import { kitandaSchema, lists } from './schema.js';
export const historyEvents = kitandaSchema.table(
  'history_events',
  {
    id: uuid().primaryKey(),
    listId: uuid()
      .notNull()
      .references(() => lists.id),
    action: text().$type<HistoryAction>().notNull(),
    actorId: text()
      .notNull()
      .references(() => user.id),
    createdAt: timestamp({ withTimezone: true })
      .notNull()
      .default(sql`clock_timestamp()`),
    details: jsonb().$type<HistoryDetails>().notNull(),
  },
  (t) => [index('history_list_page').on(t.listId, t.createdAt, t.id)],
);
export const historyTargets = kitandaSchema.table(
  'history_targets',
  {
    eventId: uuid()
      .notNull()
      .references(() => historyEvents.id, { onDelete: 'cascade' }),
    // Sem FK ao item: seu expurgo preserva os metadados residuais do evento.
    itemId: uuid().notNull(),
    details: jsonb().$type<HistoryTargetDetails>(),
    redactedAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    primaryKey({ columns: [t.eventId, t.itemId] }),
    index('history_target_item').on(t.itemId),
  ],
);
