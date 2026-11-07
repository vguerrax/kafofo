import { expect, it } from 'vitest';
import { contextName, canManageAccess } from './policies.js';
it('nomes Unicode são limitados sem truncamento', () => {
  expect(contextName(' Casa ')).toBe('Casa');
  expect(contextName('😀'.repeat(100))).toHaveLength(200);
  for (const value of ['', '   ', 'a'.repeat(101)]) expect(() => contextName(value)).toThrow();
});
it('responsáveis não nomeiam nem alteram responsáveis; global não é papel contextual', () => {
  expect(canManageAccess(false, true, null, 'collaborator')).toBe(true);
  expect(canManageAccess(false, true, 'responsible', 'viewer')).toBe(false);
  expect(canManageAccess(false, true, null, 'responsible')).toBe(false);
  expect(canManageAccess(true, false, null, 'responsible')).toBe(true);
  expect(canManageAccess(true, false, null, 'viewer')).toBe(false);
  expect(canManageAccess(false, false, null, 'responsible')).toBe(false);
});
