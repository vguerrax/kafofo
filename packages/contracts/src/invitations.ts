import { Type, type Static } from 'typebox';
const strict = { additionalProperties: false } as const;
export const InvitationTokenSchema = Type.Object(
  { token: Type.String({ minLength: 1, maxLength: 256 }) },
  strict,
);
export const InvitationRegisterSchema = Type.Object(
  {
    token: Type.String({ minLength: 1, maxLength: 256 }),
    username: Type.String({ maxLength: 1024 }),
    password: Type.String({ maxLength: 1024 }),
  },
  strict,
);
export const InvitationPreviewSchema = Type.Object({ name: Type.String() }, strict);
export const InvitationAcceptedSchema = Type.Object(
  { coreId: Type.String({ format: 'uuid' }), alreadyMember: Type.Boolean() },
  strict,
);
export const InvitationIssuedSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    link: Type.String(),
    expiresAt: Type.String({ format: 'date-time' }),
  },
  strict,
);
export const InvitationInfoSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    issuerId: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    expiresAt: Type.String({ format: 'date-time' }),
    state: Type.Union([
      Type.Literal('active'),
      Type.Literal('expired'),
      Type.Literal('revoked'),
      Type.Literal('consumed'),
    ]),
  },
  strict,
);
export type InvitationInfo = Static<typeof InvitationInfoSchema>;
export type InvitationIssued = Static<typeof InvitationIssuedSchema>;
export type InvitationAccepted = Static<typeof InvitationAcceptedSchema>;
