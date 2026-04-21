import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { normalizePath } from 'unplugin-utils';

import type {
  ArtManifest,
  ParsedArtProps,
  ParsedVariantProps,
  VariantProps,
} from '../../types/index.ts';
import { collectAttributes, parseArtSfc } from '../parser.ts';

type ArtMetadata = ParsedArtProps & {
  components: string[];
  variants?: VariantProps[];
};

function readArtMetadata(filePath: string): ArtMetadata {
  const source = readFileSync(filePath, 'utf8');
  const { artNode, variantNodes } = parseArtSfc(source, filePath);

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
    if (explicitDocsFile) {
      return;
    }

    return;
  }

  return normalizePath(path.relative(root, docsFile));
}

function toAbsoluteDocsTarget(file: string, docs: string) {
  return path.resolve(path.dirname(file), docs);
}

function resolveExistingComponents(file: string, root: string, components: string[]) {
  const relativeFile = normalizePath(path.relative(root, file));
  const resolvedComponents: string[] = [];

  for (const component of components) {
    const absoluteComponent = path.resolve(path.dirname(file), component);

    if (!existsSync(absoluteComponent)) {
      console.warn(`[@viyuni/musea] Missing component file for ${relativeFile}: ${component}`);
      continue;
    }

    resolvedComponents.push(normalizePath(path.relative(root, absoluteComponent)));
  }

  return resolvedComponents;
}

function resolveExistingTests(file: string, root: string, tests: string[]) {
  const relativeFile = normalizePath(path.relative(root, file));
  const resolvedTests: string[] = [];

  for (const testFile of tests) {
    const absoluteTestFile = path.resolve(path.dirname(file), testFile);

    if (!existsSync(absoluteTestFile)) {
      console.warn(`[@viyuni/musea] Missing test file for ${relativeFile}: ${testFile}`);
      continue;
    }

    resolvedTests.push(normalizePath(path.relative(root, absoluteTestFile)));
  }

  return resolvedTests;
}

export function resolveArtDocsTarget(file: string, root = process.cwd()) {
  const normalizedFile = normalizePath(file);
  const { docs } = readArtMetadata(normalizedFile);
  const docsFile = docs
    ? toAbsoluteDocsTarget(normalizedFile, docs)
    : normalizedFile.replace(/\.vue$/, '.md');
  return normalizePath(path.relative(root, docsFile));
}

export function toArtManifestEntry(file: string, root = process.cwd()): ArtManifest {
  const normalizedFile = normalizePath(file);
  const relativeFile = normalizePath(path.relative(root, normalizedFile));
  const meta = readArtMetadata(normalizedFile);
  const { docs, ...manifestMeta } = meta;
  const components = resolveExistingComponents(normalizedFile, root, meta.components);
  const tests = resolveExistingTests(normalizedFile, root, meta.tests);

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
