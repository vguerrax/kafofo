import { Type, type Static } from 'typebox';
export * from './auth.js';

export const HealthResponseSchema = Type.Object(
  { status: Type.Literal('ok'), service: Type.Literal('kafofo') },
  { additionalProperties: false },
);

export const ReadyResponseSchema = Type.Object(
  { status: Type.Literal('ready') },
  { additionalProperties: false },
);

export const ErrorResponseSchema = Type.Object(
  {
    error: Type.Object(
      {
        code: Type.String(),
        message: Type.String(),
        requestId: Type.String(),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export type HealthResponse = Static<typeof HealthResponseSchema>;
export type ErrorResponse = Static<typeof ErrorResponseSchema>;
export * from './contexts.js';
export * from './invitations.js';
