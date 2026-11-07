import { Value } from 'typebox/value';
import {
  ContextsSchema,
  CoreInfoSchema,
  CreatedResidenceSchema,
  MemberInfoSchema,
  ResidenceInfoSchema,
  AccessInfoSchema,
  type Contexts,
  type CoreInfo,
  type ResidenceInfo,
  type MemberInfo,
  type AccessInfo,
} from '@kafofo/contracts';
import { Type, type TSchema } from 'typebox';
import { ApiError } from './api';
async function request(path: string, method = 'GET', body?: unknown) {
  const response = await fetch('/api/platform' + path, {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    ...(body === undefined
      ? {}
      : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  });
  if (!response.ok) {
    let message = 'Não foi possível concluir. Tente novamente.';
    try {
      const data = (await response.json()) as { error?: { message?: string } };
      message = data.error?.message ?? message;
    } catch {
      /* transporte */
    }
    throw new ApiError(response.status, message);
  }
  return response;
}
async function json<T>(path: string, schema: TSchema, method = 'GET', body?: unknown): Promise<T> {
  const data: unknown = await (await request(path, method, body)).json();
  if (!Value.Check(schema, data)) throw new Error('Resposta inválida do servidor.');
  return data as T;
}
export const contextApi = {
  contexts: () => json<Contexts>('/contexts', ContextsSchema),
  createCore: (name: string) => json<CoreInfo>('/cores', CoreInfoSchema, 'POST', { name }),
  createResidence: (coreId: string, name: string, responsibleUserId: string) =>
    json<{ id: string }>('/cores/' + coreId + '/residences', CreatedResidenceSchema, 'POST', {
      name,
      responsibleUserId,
    }),
  residences: (id: string) =>
    json<ResidenceInfo[]>('/cores/' + id + '/residences', Type.Array(ResidenceInfoSchema)),
  members: (id: string) =>
    json<MemberInfo[]>('/cores/' + id + '/members', Type.Array(MemberInfoSchema)),
  accesses: (id: string) =>
    json<AccessInfo[]>('/residences/' + id + '/accesses', Type.Array(AccessInfoSchema)),
  setMember: (core: string, user: string, role: string) =>
    request('/cores/' + core + '/members/' + encodeURIComponent(user), 'PATCH', { role }),
  removeMember: (core: string, user: string) =>
    request('/cores/' + core + '/members/' + encodeURIComponent(user), 'DELETE'),
  setAccess: (res: string, user: string, role: string) =>
    request('/residences/' + res + '/accesses/' + encodeURIComponent(user), 'PUT', { role }),
  removeAccess: (res: string, user: string) =>
    request('/residences/' + res + '/accesses/' + encodeURIComponent(user), 'DELETE'),
};
