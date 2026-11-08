import { Type, type TSchema } from 'typebox';
import { Value } from 'typebox/value';
import {
  ListInfoSchema,
  ListCardSchema,
  ItemSnapshotSchema,
  MutationReceiptSchema,
  ItemReceiptSchema,
  type ItemSnapshot,
  type MutationReceipt,
  type ItemReceipt,
  type ListCard,
  ShareCandidateSchema,
  ListShareSchema,
  type ListInfo,
  type ShareCandidate,
  type ListShare,
  TrashListSchema,
  type TrashList,
  HistoryPageSchema,
  type HistoryPage,
} from '@kafofo/contracts';
import { ApiError } from './api';
async function request<T>(
  path: string,
  method = 'GET',
  body?: unknown,
  schema?: TSchema,
  key?: string,
): Promise<T> {
  const response = await fetch('/api/kitanda' + path, {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    ...(body === undefined
      ? {}
      : {
          headers: {
            'Content-Type': 'application/json',
            ...(key ? { 'Idempotency-Key': key } : {}),
          },
          body: JSON.stringify(body),
        }),
  });
  if (!response.ok) {
    let message = 'Não foi possível carregar. Tente novamente.';
    let code: string | undefined;
    try {
      const error = ((await response.json()) as { error: { message: string; code?: string } })
        .error;
      message = error.message;
      code = error.code;
    } catch {
      /* transporte */
    }
    throw new ApiError(response.status, message, code);
  }
  if (response.status === 204 && key) {
    const receipt = {
      confirmed: true,
      resourceId: response.headers.get('X-Resource-Id'),
      version: Number(response.headers.get('X-Item-Version')),
    };
    if (!Value.Check(ItemReceiptSchema, receipt)) throw new Error('Confirmação inválida.');
    return receipt as T;
  }
  if (!schema) return undefined as T;
  const data: unknown = await response.json();
  if (!Value.Check(schema, data)) throw new Error('Resposta inválida do servidor.');
  return data as T;
}
export const kitandaApi = {
  history: (list: string, cursor: string | null) =>
    request<HistoryPage>(
      '/lists/' + list + '/history' + (cursor ? '?cursor=' + encodeURIComponent(cursor) : ''),
      'GET',
      undefined,
      HistoryPageSchema,
    ),
  trash: (res: string) =>
    request<TrashList[]>(
      '/residences/' + res + '/trash',
      'GET',
      undefined,
      Type.Array(TrashListSchema),
    ),
  collection: (res: string) =>
    request<ListCard[]>(
      '/residences/' + res + '/lists',
      'GET',
      undefined,
      Type.Array(ListCardSchema),
    ),
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

export interface PendingCommand {
  path: string;
  method: string;
  payload: unknown;
  key: string;
  startedAt: number;
  item: boolean;
}
export function prepareCommand(
  path: string,
  method: string,
  payload: unknown,
  item = true,
): PendingCommand {
  return {
    path,
    method,
    payload: structuredClone(payload),
    key: crypto.randomUUID(),
    startedAt: Date.now(),
    item,
  };
}
export async function sendCommand(command: PendingCommand): Promise<MutationReceipt | ItemReceipt> {
  return request(
    command.path,
    command.method,
    command.payload,
    command.item ? ItemReceiptSchema : MutationReceiptSchema,
    command.key,
  );
}
export const itemApi = {
  snapshot: (id: string) =>
    request<ItemSnapshot>('/lists/' + id + '/items', 'GET', undefined, ItemSnapshotSchema),
};
