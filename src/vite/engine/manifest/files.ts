import { createHash } from 'node:crypto';
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
  const isWindows = process.platform === 'win32';
  const relative = isWindows
    ? path.relative(root, file)
    : path.posix.relative(normalizePath(root), normalizePath(file));
  const normalizedRelative = normalizePath(relative);
  return createHash('sha256').update(normalizedRelative).digest('hex');
}
