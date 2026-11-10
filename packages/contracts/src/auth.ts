import { Type, type Static } from 'typebox';
const object = { additionalProperties: false } as const;
// Limites de transporte; as políticas de senha/username são verificadas pelo serviço.
const credential = Type.String({ maxLength: 1024 });
export const SetupStateSchema = Type.Object({ configured: Type.Boolean() }, object);
export const SetupRequestSchema = Type.Object(
  { code: Type.String({ maxLength: 256 }), username: credential, password: credential },
  object,
);
export const LoginRequestSchema = Type.Object(
  { username: credential, password: credential },
  object,
);
export const PasswordRequestSchema = Type.Object(
  { currentPassword: credential, newPassword: credential },
  object,
);
export const EmptyRequestSchema = Type.Object({}, object);
export const PublicUserSchema = Type.Object(
  { id: Type.String(), username: Type.String(), name: Type.String(), globalAdmin: Type.Boolean() },
  object,
);
export const SessionResponseSchema = Type.Object(
  { user: PublicUserSchema, expiresAt: Type.String({ format: 'date-time' }) },
  object,
);
export type SessionResponse = Static<typeof SessionResponseSchema>;
export type SetupRequest = Static<typeof SetupRequestSchema>;
export type LoginRequest = Static<typeof LoginRequestSchema>;
export type PasswordRequest = Static<typeof PasswordRequestSchema>;
