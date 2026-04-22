import path from 'node:path';

import { normalizePath } from 'unplugin-utils';

import { toRelativePath } from '../../shared/utils.ts';
import type { VirtualFileDefinition } from '../../types/index.ts';

export function createImport(url: string, searchParams?: URLSearchParams) {
  const request = searchParams?.size ? `${url}?${searchParams.toString()}` : url;
  return `() => import(${JSON.stringify(request)})` as const;
}

export function serializeModuleValue(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function createConstExport(name: string, value: string) {
  return `export const ${name} = ${value};` as const;
}

export function createDefaultExport(value: string) {
  return `export default ${value};` as const;
}

export function renderObjectLiteral(entries: string[]) {
  return entries.length ? `{\n${entries.join(',\n')}\n}` : '{}';
}

export function defineVirtualFile(definition: VirtualFileDefinition) {
  return definition;
}

export function normalizeForImport(file: string, root = process.cwd()) {
  const abs = path.isAbsolute(file) ? file : path.resolve(root, file);
  const rel = toRelativePath(file, root);
  const importPath = rel.startsWith('..') ? `/@fs/${normalizePath(abs)}` : `/${rel}`;

  return importPath;
}
