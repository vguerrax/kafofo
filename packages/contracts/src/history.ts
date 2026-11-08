import { Type, type Static } from 'typebox';
const strict = { additionalProperties: false } as const;
const text = Type.Union([Type.String(), Type.Null()]);
const change = (schema: typeof text) => Type.Object({ before: schema, after: schema }, strict);
export const ListHistoryChangesSchema = Type.Object(
  { name: Type.Optional(change(text)), description: Type.Optional(change(text)) },
  strict,
);
export const ItemHistoryChangesSchema = Type.Object(
  {
    name: Type.Optional(change(text)),
    quantity: Type.Optional(change(text)),
    unit: Type.Optional(change(text)),
    notes: Type.Optional(change(text)),
    purchased: Type.Optional(
      Type.Object({ before: Type.Boolean(), after: Type.Boolean() }, strict),
    ),
    deleted: Type.Optional(Type.Object({ before: Type.Boolean(), after: Type.Boolean() }, strict)),
  },
  strict,
);
export const HistoryActionSchema = Type.Union([
  Type.Literal('list.created'),
  Type.Literal('list.updated'),
  Type.Literal('list.removed'),
  Type.Literal('list.restored'),
  Type.Literal('share.granted'),
  Type.Literal('share.revoked'),
  Type.Literal('item.created'),
  Type.Literal('item.updated'),
  Type.Literal('item.purchased'),
  Type.Literal('item.unpurchased'),
  Type.Literal('item.removed'),
  Type.Literal('items.cleared'),
]);
export const HistoryDetailsSchema = Type.Object(
  {
    changes: Type.Optional(ListHistoryChangesSchema),
    participant: Type.Optional(
      Type.Object({ id: Type.String({ format: 'uuid' }), name: Type.String() }, strict),
    ),
  },
  strict,
);
export const HistoryTargetDetailsSchema = Type.Object(
  { name: Type.String(), changes: ItemHistoryChangesSchema },
  strict,
);
export const HistoryEventSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    listId: Type.String({ format: 'uuid' }),
    action: HistoryActionSchema,
    actor: Type.Object({ id: Type.String(), name: Type.String() }, strict),
    occurredAt: Type.String({ format: 'date-time' }),
    details: HistoryDetailsSchema,
    targets: Type.Array(
      Type.Object(
        {
          itemId: Type.String({ format: 'uuid' }),
          details: Type.Union([HistoryTargetDetailsSchema, Type.Null()]),
        },
        strict,
      ),
    ),
  },
  strict,
);
export const HistoryQuerySchema = Type.Object(
  {
    cursor: Type.Optional(Type.String({ minLength: 1, maxLength: 1024 })),
    limit: Type.Optional(Type.String({ pattern: '^([1-9]|[1-4][0-9]|50)$' })),
  },
  strict,
);
export const HistoryPageSchema = Type.Object(
  { events: Type.Array(HistoryEventSchema), nextCursor: Type.Union([Type.String(), Type.Null()]) },
  strict,
);
export type HistoryAction = Static<typeof HistoryActionSchema>;
export type HistoryDetails = Static<typeof HistoryDetailsSchema>;
export type HistoryTargetDetails = Static<typeof HistoryTargetDetailsSchema>;
export type HistoryEvent = Static<typeof HistoryEventSchema>;
export type HistoryPage = Static<typeof HistoryPageSchema>;
