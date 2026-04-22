import { describe, expect, test } from 'vite-plus/test';

import { invalidateVirtualModules } from '../utils.ts';

function createServer(moduleIds: string[]) {
  const idToModuleMap = new Map(moduleIds.map((id) => [id, { id }]));
  const invalidated: string[] = [];

  return {
    invalidated,
    server: {
      moduleGraph: {
        idToModuleMap,
        getModuleById(id: string) {
          return idToModuleMap.get(id);
        },
        invalidateModule(moduleNode: { id: string }) {
          invalidated.push(moduleNode.id);
        },
      },
    },
  };
}

describe('invalidateVirtualModules', () => {
  test('invalidates only modules that exist in module graph', () => {
    const { server, invalidated } = createServer(['\0virtual:a', '\0virtual:b']);

    const nodes = invalidateVirtualModules(server as never, [
      '\0virtual:a',
      '\0virtual:missing',
      '\0virtual:b',
    ]);

    expect(invalidated).toEqual(['\0virtual:a', '\0virtual:b']);
    expect(nodes.map((node) => node.id)).toEqual(['\0virtual:a', '\0virtual:b']);
  });
});
