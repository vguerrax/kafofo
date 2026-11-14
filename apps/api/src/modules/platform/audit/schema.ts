import { uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { platformSchema, user } from '../auth/schema.js';
export type SecurityAction =
  | 'invitation.issued'
  | 'invitation.accepted'
  | 'invitation.revoked'
  | 'membership.created'
  | 'membership.role-changed'
  | 'membership.revoked'
  | 'residence-access.created'
  | 'residence-access.role-changed'
  | 'residence-access.revoked';
export const securityEvents = platformSchema.table(
  'security_events',
  {
    id: uuid().primaryKey(),
    action: text().$type<SecurityAction>().notNull(),
    actorId: text()
      .notNull()
      .references(() => user.id),
    targetId: text(),
    coreId: uuid().notNull(),
    residenceId: uuid(),
    invitationId: uuid(),
    membershipId: uuid(),
    residenceAccessId: uuid(),
    previousRole: text(),
    nextRole: text(),
    createdAt: timestamp({ withTimezone: true })
      .notNull()
      .default(sql`clock_timestamp()`),
  },
  (t) => [
    index('security_event_expiry').on(t.createdAt),
    index('security_event_target').on(t.targetId, t.createdAt),
  ],
);
