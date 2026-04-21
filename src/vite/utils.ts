import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { normalizePath } from 'unplugin-utils';

export function getFilePath(file: string) {
  const base = path.dirname(normalizePath(fileURLToPath(import.meta.url)));
  return `/@fs/${normalizePath(path.resolve(base, file))}`;
}
