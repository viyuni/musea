import path from 'node:path';

import { globSync } from 'tinyglobby';
import { normalizePath } from 'unplugin-utils';

export function findArtFiles(patterns: string[], ignore: string[], root = process.cwd()) {
  return globSync(patterns, {
    absolute: true,
    cwd: root,
    ignore,
    onlyFiles: true,
  });
}

export function toManifestCacheKey(file: string, root: string) {
  return normalizePath(path.relative(root, file));
}
