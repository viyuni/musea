import { existsSync } from 'node:fs';
import path from 'node:path';

import { ComponentMetaResolver } from '@viyuni/vue-component-meta';

export function resolveTsconfigPath(cwd = process.cwd(), tsconfig: string) {
  const explicitTsconfig = path.resolve(cwd, tsconfig);

  if (!existsSync(explicitTsconfig)) throw new Error(`Cannot find tsconfig at ${explicitTsconfig}`);

  return explicitTsconfig;
}

export function createDocsChecker({
  root = process.cwd(),
  tsconfig = 'tsconfig.json',
}: {
  root?: string;
  tsconfig?: string;
}): ComponentMetaResolver {
  const tsconfigPath = resolveTsconfigPath(root, tsconfig);
  return new ComponentMetaResolver({
    root,
    tsconfig: tsconfigPath,
  });
}

export function resolveComponentDocs({
  fileName,
  resolver,
}: {
  fileName: string;
  resolver: ComponentMetaResolver;
}) {
  return resolver.resolveComponentMeta(fileName);
}
