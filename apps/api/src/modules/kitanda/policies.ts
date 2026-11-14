import { AuthError } from '../platform/public.js';
export function listCapabilities(
  creator: boolean,
  role: 'responsible' | 'collaborator' | 'viewer',
) {
  const canWrite = role !== 'viewer';
  return { canWrite, canManageShares: creator && canWrite };
}
export function listFields(input: { name?: string; description?: string }) {
  const output: { name?: string; description?: string | null } = {};
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name || [...name].length > 120 || /[\r\n\u2028\u2029]/u.test(name))
      throw new AuthError(
        400,
        'INVALID_LIST_NAME',
        'Informe nome em linha única com até 120 caracteres.',
      );
    output.name = name;
  }
  if (input.description !== undefined) {
    const description = input.description.trim();
    if ([...description].length > 2000)
      throw new AuthError(
        400,
        'INVALID_LIST_DESCRIPTION',
        'A descrição deve ter até 2.000 caracteres.',
      );
    output.description = description || null;
  }
  return output;
}
