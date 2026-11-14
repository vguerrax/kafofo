import { AuthError } from '../platform/public.js';
export interface ItemInput {
  name?: string;
  quantity?: string | null;
  unit?: string | null;
  notes?: string | null;
}
export function canonicalQuantity(value: string): string {
  if (!/^\d+(?:\.\d{1,3})?$/.test(value))
    throw new AuthError(
      400,
      'INVALID_QUANTITY',
      'Use quantidade decimal positiva com até três casas e máximo 999999.999.',
    );
  const [integer, decimal = ''] = value.split('.'),
    whole = integer!.replace(/^0+/, '') || '0',
    fraction = decimal.replace(/0+$/, '');
  if (whole.length > 6 || (whole === '0' && !fraction))
    throw new AuthError(
      400,
      'INVALID_QUANTITY',
      'Use quantidade decimal positiva com até três casas e máximo 999999.999.',
    );
  return whole + (fraction ? '.' + fraction : '');
}
export function itemFields(input: ItemInput) {
  const fields: ItemInput = {};
  for (const key of ['name', 'unit', 'notes'] as const) {
    const raw = input[key];
    if (raw === undefined) continue;
    const value = raw?.trim() ?? '';
    const limit = key === 'name' ? 120 : key === 'unit' ? 20 : 1000;
    if (
      (key === 'name' && !value) ||
      [...value].length > limit ||
      (key !== 'notes' && /[\r\n\u2028\u2029]/u.test(value))
    )
      throw new AuthError(
        400,
        'INVALID_ITEM_TEXT',
        'Confira nome (até 120), unidade (até 20, linha única) e observação (até 1.000 caracteres).',
      );
    if (key === 'name') fields.name = value;
    else fields[key] = value || null;
  }
  if (input.quantity !== undefined)
    fields.quantity = input.quantity === null ? null : canonicalQuantity(input.quantity);
  return fields;
}
