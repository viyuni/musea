import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { normalizePath } from 'unplugin-utils';

import { warn } from '../../../shared/logger.ts';
import type {
  ArtManifest,
  ParsedArtProps,
  ParsedVariantProps,
  VariantProps,
} from '../../../types/index.ts';
import { collectAttributes, parseArtSfc } from '../parser.ts';

type ArtMetadata = ParsedArtProps & {
  components: string[];
  variants?: VariantProps[];
};

function readArtMetadata(filePath: string): ArtMetadata | undefined {
  const source = readFileSync(filePath, 'utf8');
  const parsed = parseArtSfc(source, filePath);

  if (!parsed) {
    return;
  }

  const { artNode, variantNodes } = parsed;

  const art = collectAttributes(artNode) as unknown as ParsedArtProps;
  const variants = variantNodes.map((item) => {
    const parsed = collectAttributes(item) as unknown as ParsedVariantProps;
    return {
      name: parsed.name,
      default: parsed.default,
      description: parsed.description,
    };
  });

  return {
    ...art,
    variants,
  };
}

function normalizeTags(tags: string | undefined) {
  return tags?.split(',').map((tag) => tag.trim()) ?? [];
}

function resolveDocsFile(file: string, root: string, docs: string | undefined) {
  const explicitDocsFile = docs ? toAbsoluteDocsTarget(file, docs) : undefined;
  // Keep emitted manifest paths root-relative so virtual files can stay portable.
  const docsFile = explicitDocsFile ?? file.replace(/\.vue$/, '.md');

  if (!existsSync(docsFile)) {
    return;
  }

  return normalizePath(path.relative(root, docsFile));
}

function toAbsoluteDocsTarget(file: string, docs: string) {
  return path.resolve(path.dirname(file), docs);
}

function resolveExistingFiles(
  file: string,
  root: string,
  files: string[],
  kind: 'component' | 'test',
) {
  const relativeFile = normalizePath(path.relative(root, file));
  const resolvedFiles: string[] = [];

  for (const item of files) {
    const absoluteFile = path.resolve(path.dirname(file), item);

    if (!existsSync(absoluteFile)) {
      warn(`Missing ${kind} file for ${relativeFile}: ${item}`);
      continue;
    }

    resolvedFiles.push(normalizePath(path.relative(root, absoluteFile)));
  }

  return resolvedFiles;
}

export function resolveArtDocsTarget(file: string, root = process.cwd()) {
  const normalizedFile = normalizePath(file);
  const docs = readArtMetadata(normalizedFile)?.docs;
  const docsFile = docs
    ? toAbsoluteDocsTarget(normalizedFile, docs)
    : normalizedFile.replace(/\.vue$/, '.md');
  return normalizePath(path.relative(root, docsFile));
}

export function toArtManifestEntry(file: string, root = process.cwd()): ArtManifest | undefined {
  const normalizedFile = normalizePath(file);
  const relativeFile = normalizePath(path.relative(root, normalizedFile));
  const meta = readArtMetadata(normalizedFile);

  if (!meta) {
    return;
  }

  const { docs, ...manifestMeta } = meta;
  const components = resolveExistingFiles(normalizedFile, root, meta.components, 'component');
  const tests = resolveExistingFiles(normalizedFile, root, meta.tests, 'test');

  return {
    ...manifestMeta,
    tags: normalizeTags(meta.tags),
    file: relativeFile,
    id: relativeFile,
    components,
    tests,
    docsFile: resolveDocsFile(normalizedFile, root, docs),
  };
}
