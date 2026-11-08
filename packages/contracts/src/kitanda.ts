import { Type, type Static } from 'typebox';
const strict = { additionalProperties: false } as const;
const fields = {
  name: Type.String({ maxLength: 8192 }),
  description: Type.Optional(Type.String({ maxLength: 8192 })),
};
export const ListCreateSchema = Type.Object(fields, strict);
export const ListUpdateSchema = Type.Object(
  { name: Type.Optional(fields.name), description: fields.description },
  { ...strict, minProperties: 1 },
);
export const ListInfoSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    residenceId: Type.String({ format: 'uuid' }),
    creatorId: Type.String(),
    name: Type.String(),
    description: Type.Optional(Type.String()),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
    canWrite: Type.Boolean(),
    canManageShares: Type.Boolean(),
  },
  strict,
);
export const ShareCandidateSchema = Type.Object(
  { id: Type.String({ format: 'uuid' }), name: Type.String() },
  strict,
);
export const ListShareSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    residenceAccessId: Type.String({ format: 'uuid' }),
    name: Type.String(),
  },
  strict,
);
export type ListInfo = Static<typeof ListInfoSchema>;
export type ShareCandidate = Static<typeof ShareCandidateSchema>;
export type ListShare = Static<typeof ListShareSchema>;
