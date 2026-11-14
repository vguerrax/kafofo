import { Type, type Static } from 'typebox';
const strict = { additionalProperties: false } as const;
export const CoreRoleSchema = Type.Union([Type.Literal('admin'), Type.Literal('member')]);
export const ResidenceRoleSchema = Type.Union([
  Type.Literal('responsible'),
  Type.Literal('collaborator'),
  Type.Literal('viewer'),
]);
export const ContextNameRequestSchema = Type.Object(
  { name: Type.String({ maxLength: 1024 }) },
  strict,
);
export const ResidenceRequestSchema = Type.Object(
  {
    name: Type.String({ maxLength: 1024 }),
    responsibleUserId: Type.String({ minLength: 1, maxLength: 128 }),
  },
  strict,
);
export const CoreInfoSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    role: CoreRoleSchema,
    canManageMembers: Type.Boolean(),
    canCreateResidence: Type.Boolean(),
  },
  strict,
);
export const ResidenceInfoSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    coreId: Type.String({ format: 'uuid' }),
    name: Type.String(),
    role: Type.Union([ResidenceRoleSchema, Type.Null()]),
    canManageResponsible: Type.Boolean(),
    canManageAccesses: Type.Boolean(),
  },
  strict,
);
export const CreatedResidenceSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    coreId: Type.String({ format: 'uuid' }),
    name: Type.String(),
  },
  strict,
);
export const ContextsSchema = Type.Object(
  { cores: Type.Array(CoreInfoSchema), residences: Type.Array(ResidenceInfoSchema) },
  strict,
);
export const MemberInfoSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    userId: Type.String(),
    name: Type.String(),
    role: CoreRoleSchema,
  },
  strict,
);
export const AccessInfoSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    userId: Type.String(),
    name: Type.String(),
    role: ResidenceRoleSchema,
  },
  strict,
);
export const MemberRoleRequestSchema = Type.Object({ role: CoreRoleSchema }, strict);
export const AccessRoleRequestSchema = Type.Object({ role: ResidenceRoleSchema }, strict);
export type Contexts = Static<typeof ContextsSchema>;
export type CoreInfo = Static<typeof CoreInfoSchema>;
export type ResidenceInfo = Static<typeof ResidenceInfoSchema>;
export type MemberInfo = Static<typeof MemberInfoSchema>;
export type AccessInfo = Static<typeof AccessInfoSchema>;
export type CoreRole = Static<typeof CoreRoleSchema>;
export type ResidenceRole = Static<typeof ResidenceRoleSchema>;
