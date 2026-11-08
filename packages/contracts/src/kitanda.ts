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

export const ListCardSchema = Type.Object(
  {
    ...ListInfoSchema.properties,
    residenceName: Type.String(),
    totalActive: Type.Integer({ minimum: 0 }),
    totalPurchased: Type.Integer({ minimum: 0 }),
  },
  strict,
);
export type ListCard = Static<typeof ListCardSchema>;
const nullableText = Type.Union([Type.String({ maxLength: 8192 }), Type.Null()]);
const quantity = Type.Union([Type.String({ maxLength: 1024 }), Type.Null()]);
const itemFields = {
  name: Type.String({ maxLength: 8192 }),
  quantity: Type.Optional(quantity),
  unit: Type.Optional(nullableText),
  notes: Type.Optional(nullableText),
};
export const ItemCreateSchema = Type.Object(itemFields, strict);
export const ItemUpdateSchema = Type.Object(
  { ...itemFields, name: Type.Optional(itemFields.name) },
  { ...strict, minProperties: 1 },
);
export const ItemPurchasedSchema = Type.Object({ purchased: Type.Boolean() }, strict);
export const ItemInfoSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    listId: Type.String({ format: 'uuid' }),
    name: Type.String(),
    quantity: Type.Union([Type.String(), Type.Null()]),
    unit: Type.Union([Type.String(), Type.Null()]),
    notes: Type.Union([Type.String(), Type.Null()]),
    purchased: Type.Boolean(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
  },
  strict,
);
export type ItemInfo = Static<typeof ItemInfoSchema>;
export type ItemCreate = Static<typeof ItemCreateSchema>;
export type ItemUpdate = Static<typeof ItemUpdateSchema>;
