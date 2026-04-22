import type { VirtualFileDefinition, VirtualFileRegistryContext } from '../../types/index.ts';

function parseRequestQuery(id: string) {
  const queryIndex = id.indexOf('?');
  if (queryIndex < 0) {
    return new URLSearchParams();
  }

  return new URLSearchParams(id.slice(queryIndex + 1));
}

export function createVirtualFileRegistry(files: VirtualFileDefinition[]) {
  function findMatchedRequest(id: string) {
    for (const file of files) {
      if (typeof file.id !== 'string') continue;

      if (id === file.id || id.startsWith(`${file.id}?`)) {
        return file.id;
      }
    }
  }

  return {
    resolveId(id: string, ctx: VirtualFileRegistryContext) {
      for (const file of files) {
        if (typeof file.id !== 'function') continue;

        const searchParams = parseRequestQuery(id);
        const resolveId = file.id({
          requestId: id,
          searchParams,
          ...ctx,
        });

        if (resolveId) {
          return resolveId;
        }
      }

      const requestId = findMatchedRequest(id);
      if (!requestId) return;

      const file = files.find((entry) => entry.id === requestId)!;

      const resolvedId = `\0${file.id}`;
      return id === requestId ? resolvedId : `${resolvedId}${id.slice(requestId.length)}`;
    },

    async load(id: string, ctx: VirtualFileRegistryContext) {
      for (const file of files) {
        let requestId: string | null = null;

        if (file.matchLoad) {
          requestId = file.matchLoad(id, parseRequestQuery(id));
        }

        if (!requestId) {
          if (typeof file.id !== 'string') {
            continue;
          }

          const resolvedId = `\0${file.id}`;

          if (id === resolvedId) {
            requestId = file.id;
          } else if (id.startsWith(`${resolvedId}?`)) {
            requestId = `${file.id}${id.slice(resolvedId.length)}`;
          }
        }

        if (!requestId) continue;

        return await file.load({
          requestId,
          resolvedId: id,
          searchParams: parseRequestQuery(requestId),
          ...ctx,
        });
      }
    },
  };
}
