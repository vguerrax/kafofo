import { expect, it } from 'vitest';
import { itemFields, canonicalQuantity } from './item-policies.js';
it.each([
  '0',
  '0.000',
  '-1',
  '1000000',
  '999999.9999',
  '1.0000',
  '1e2',
  '1,5',
  '1 000',
  '1.',
  ' 1',
  '+1',
])('recusa quantidade %s sem arredondamento', (value) => {
  expect(() => canonicalQuantity(value)).toThrow();
});
it.each([
  ['0.001', '0.001'],
  ['999999.999', '999999.999'],
  ['0001.200', '1.2'],
  ['1.000', '1'],
])('canoniza %s para %s', (input, output) => {
  expect(canonicalQuantity(input)).toBe(output);
});
it('campos opcionais independentes e trim preservam espaços internos', () => {
  expect(
    itemFields({
      name: '  Café  da casa ',
      quantity: null,
      unit: ' kg ',
      notes: ' linha  um\nlinha dois ',
    }),
  ).toEqual({ name: 'Café  da casa', quantity: null, unit: 'kg', notes: 'linha  um\nlinha dois' });
  expect(itemFields({ unit: ' ', notes: '', quantity: '2' })).toEqual({
    unit: null,
    notes: null,
    quantity: '2',
  });
  expect(itemFields({ quantity: null, unit: null, notes: null })).toEqual({
    quantity: null,
    unit: null,
    notes: null,
  });
});
it('textos limitados por caracteres e linhas sem truncamento', () => {
  for (const input of [
    { name: ' ' },
    { name: 'a\nb' },
    { name: 'a'.repeat(121) },
    { unit: 'a'.repeat(21) },
    { unit: 'a\nb' },
    { notes: 'a'.repeat(1001) },
  ])
    expect(() => itemFields(input)).toThrow();
  expect(
    itemFields({ name: '😀'.repeat(120), unit: 'a'.repeat(20), notes: 'x'.repeat(1000) }).name,
  ).toHaveLength(240);
});
