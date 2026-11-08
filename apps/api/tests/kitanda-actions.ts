import { randomUUID } from 'node:crypto';
import type { createKitandaService } from '../src/modules/kitanda/service.js';
import type { createItemService } from '../src/modules/kitanda/items.js';
import type { ItemInput } from '../src/modules/kitanda/item-policies.js';
// Regressões funcionais usam uma versão recém-lida; conflitos são exercitados
// separadamente contra os comandos reais, com versões/chaves explícitas.
export function listActions(commands: ReturnType<typeof createKitandaService>) {
  return {
    ...commands,
    async create(h: Headers, res: string, input: { name: string; description?: string }) {
      const receipt = await commands.create(h, res, input, randomUUID());
      return commands.detail(h, receipt.resourceId);
    },
  };
}
export function itemActions(commands: ReturnType<typeof createItemService>) {
  const read = async (h: Headers, list: string, id: string) =>
    (await commands.collection(h, list)).find((r) => r.id === id);
  return {
    ...commands,
    async create(h: Headers, list: string, input: ItemInput & { name: string }) {
      const r = await commands.create(h, list, input, randomUUID());
      return (await read(h, list, r.resourceId))!;
    },
    async update(h: Headers, list: string, id: string, input: ItemInput) {
      await commands.update(
        h,
        list,
        id,
        { ...input, expectedVersion: (await read(h, list, id))?.version ?? 1 },
        randomUUID(),
      );
      return (await read(h, list, id))!;
    },
    async purchased(h: Headers, list: string, id: string, value: boolean) {
      await commands.purchased(
        h,
        list,
        id,
        value,
        (await read(h, list, id))?.version ?? 1,
        randomUUID(),
      );
      return (await read(h, list, id))!;
    },
    async remove(h: Headers, list: string, id: string) {
      return commands.remove(h, list, id, (await read(h, list, id))?.version ?? 1, randomUUID());
    },
  };
}
