import { Type, type Static } from 'typebox';
import { CoreRoleSchema, ResidenceRoleSchema } from './contexts.js';
import { HistoryActionSchema } from './history.js';

const strict = { additionalProperties: false } as const;
const at = Type.String({ format: 'date-time' });
export const IndividualExportRequestSchema = Type.Object(
  { password: Type.String({ maxLength: 1024 }) },
  strict,
);
export const IndividualMembershipSchema = Type.Union([
  Type.Object(
    {
      type: Type.Literal('core'),
      id: Type.String({ format: 'uuid' }),
      name: Type.String(),
      role: CoreRoleSchema,
    },
    strict,
  ),
  Type.Object(
    {
      type: Type.Literal('residence'),
      id: Type.String({ format: 'uuid' }),
      name: Type.String(),
      role: ResidenceRoleSchema,
    },
    strict,
  ),
]);
export const IndividualSecurityEventSchema = Type.Object(
  {
    type: Type.String(),
    occurredAt: at,
    channel: Type.Optional(Type.Union([Type.Literal('admin'), Type.Literal('operator')])),
  },
  strict,
);
export const IndividualKitandaActionSchema = Type.Object(
  { type: HistoryActionSchema, occurredAt: at, listId: Type.String({ format: 'uuid' }) },
  strict,
);
export const IndividualExportSchema = Type.Object(
  {
    schemaVersion: Type.Literal(1),
    generatedAt: at,
    profile: Type.Object({ username: Type.String(), name: Type.String(), createdAt: at }, strict),
    memberships: Type.Array(IndividualMembershipSchema),
    securityEvents: Type.Array(IndividualSecurityEventSchema),
    kitandaActions: Type.Array(IndividualKitandaActionSchema),
  },
  strict,
);
export type IndividualExport = Static<typeof IndividualExportSchema>;
export type IndividualMembership = Static<typeof IndividualMembershipSchema>;
export type IndividualSecurityEvent = Static<typeof IndividualSecurityEventSchema>;
export type IndividualKitandaAction = Static<typeof IndividualKitandaActionSchema>;
