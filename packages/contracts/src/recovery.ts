import { Type } from 'typebox';
const strict = { additionalProperties: false } as const;
export const RecoveryIssueSchema = Type.Object(
  { username: Type.String({ maxLength: 30, minLength: 3 }) },
  strict,
);
export const RecoveryLinkSchema = Type.Object(
  { link: Type.String(), expiresAt: Type.String({ format: 'date-time' }) },
  strict,
);
export const RecoveryTokenSchema = Type.Object(
  { token: Type.String({ maxLength: 256, minLength: 1 }) },
  strict,
);
export const RecoveryPreviewSchema = Type.Object({ valid: Type.Literal(true) }, strict);
export const RecoveryCompleteSchema = Type.Object(
  {
    token: Type.String({ maxLength: 256, minLength: 1 }),
    newPassword: Type.String({ maxLength: 1024 }),
  },
  strict,
);
