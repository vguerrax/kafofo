import { Type, type TSchema } from 'typebox';
import { Value } from 'typebox/value';
import {
  ListInfoSchema,
  ShareCandidateSchema,
  ListShareSchema,
  type ListInfo,
  type ShareCandidate,
  type ListShare,
} from '@kafofo/contracts';
import { ApiError } from './api';
async function request<T>(
  path: string,
  method = 'GET',
  body?: unknown,
  schema?: TSchema,
): Promise<T> {
  const response = await fetch('/api/kitanda' + path, {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    ...(body === undefined
      ? {}
      : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  });
  if (!response.ok) {
    let message = 'Não foi possível carregar. Tente novamente.';
    try {
      message = ((await response.json()) as { error: { message: string } }).error.message;
    } catch {
      /* transporte */
    }
    throw new ApiError(response.status, message);
  }
  if (!schema) return undefined as T;
  const data: unknown = await response.json();
  if (!Value.Check(schema, data)) throw new Error('Resposta inválida do servidor.');
  return data as T;
}
export const kitandaApi = {
  collection: (res: string) =>
    request<ListInfo[]>(
      '/residences/' + res + '/lists',
      'GET',
      undefined,
      Type.Array(ListInfoSchema),
    ),
  create: (res: string, input: { name: string; description: string }) =>
    request<ListInfo>('/residences/' + res + '/lists', 'POST', input, ListInfoSchema),
  detail: (id: string) => request<ListInfo>('/lists/' + id, 'GET', undefined, ListInfoSchema),
  update: (id: string, input: { name: string; description: string }) =>
    request<ListInfo>('/lists/' + id, 'PATCH', input, ListInfoSchema),
  candidates: (id: string) =>
    request<ShareCandidate[]>(
      '/lists/' + id + '/share-candidates',
      'GET',
      undefined,
      Type.Array(ShareCandidateSchema),
    ),
  shares: (id: string) =>
    request<ListShare[]>('/lists/' + id + '/shares', 'GET', undefined, Type.Array(ListShareSchema)),
  share: (id: string, access: string) => request<void>('/lists/' + id + '/shares/' + access, 'PUT'),
  revoke: (id: string, access: string) =>
    request<void>('/lists/' + id + '/shares/' + access, 'DELETE'),
};
