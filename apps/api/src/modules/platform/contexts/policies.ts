import { AuthError } from '../auth/policies.js';
export type CoreRole = 'admin' | 'member';
export type ResidenceRole = 'responsible' | 'collaborator' | 'viewer';
export function contextName(value: string) {
  const result = value.trim();
  if (!result || [...result].length > 100)
    throw new AuthError(400, 'INVALID_NAME', 'Informe um nome de 1 a 100 caracteres.');
  return result;
}
export function canManageAccess(
  admin: boolean,
  responsible: boolean,
  current: ResidenceRole | null,
  next: ResidenceRole | null,
) {
  return current === 'responsible' || next === 'responsible' ? admin : responsible;
}
export const forbidden = () =>
  new AuthError(403, 'FORBIDDEN', 'Você não pode realizar esta operação.');
export const notFound = () => new AuthError(404, 'NOT_FOUND', 'Contexto não encontrado.');
