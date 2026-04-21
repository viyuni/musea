import type { ModuleNode, ViteDevServer } from 'vite';

export function invalidateVirtualModules(server: ViteDevServer, modules: readonly string[]) {
  const invalidatedModules: ModuleNode[] = [];

  for (const id of modules) {
    const moduleNode = server.moduleGraph.getModuleById(id);

    if (moduleNode) {
      server.moduleGraph.invalidateModule(moduleNode);
      invalidatedModules.push(moduleNode);
    }
  }

  return invalidatedModules;
}
