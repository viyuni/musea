import path from 'node:path';

import { globSync } from 'tinyglobby';
import { normalizePath } from 'unplugin-utils';

export function findArtFiles(patterns: string[], ignore: string[], cwd = process.cwd()) {
  return globSync(patterns, {
    absolute: true,
    cwd,
    ignore,
    onlyFiles: true,
  });
}

export function toManifestCacheKey(file: string, root: string) {
  return normalizePath(path.relative(root, file));
}
