import type { ResolvedComponentMeta } from '@viyuni/vue-component-meta/types';

import { VIRTUAL_DOCS } from '../../../shared/constants.ts';
import type { VirtualFileContext } from '../../../types/index.ts';
import { resolveComponentDocs } from '../../engine/resolve-component-doc.ts';
import {
  createConstExport,
  createImport,
  defineVirtualFile,
  normalizeForImport,
  renderObjectLiteral,
  serializeModuleValue,
} from '../helpers.ts';

function createStaticImport(name: string, request: string) {
  return `import ${name} from ${serializeModuleValue(request)};`;
}

function createReExport(request: string) {
  return `export * from ${serializeModuleValue(request)};`;
}

function renderDocsModulesExport({ artManifest }: VirtualFileContext) {
  return createConstExport(
    'docsModules',
    renderObjectLiteral(
      artManifest.map(
        (art) =>
          `${JSON.stringify(art.id)}: ${createImport(VIRTUAL_DOCS.id, new URLSearchParams({ artId: art.id }))}`,
      ),
    ),
  );
}

function renderArtDocsExport(artId: string, ctx: VirtualFileContext) {
  const art = ctx.artManifest.find((art) => art.id === artId);
  const imports: string[] = [];

  if (!art) {
    resolveArtDocs(artId, ctx);
    return createConstExport('docs', renderObjectLiteral([`meta: []`, `markdown: undefined`]));
  }

  const meta = resolveArtDocs(art.id, ctx);
  const markdownName = 'markdown';

  for (const doc of meta) {
    imports.push(createReExport(normalizeForImport(doc.file, ctx.root)));
  }

  if (art.docsFile) {
    imports.push(createStaticImport(markdownName, normalizeForImport(art.docsFile, ctx.root)));
  }

  return [
    ...imports,
    createConstExport(
      'docs',
      renderObjectLiteral([
        `meta: ${serializeModuleValue(meta)}`,
        `markdown: ${art.docsFile ? markdownName : 'undefined'}`,
      ]),
    ),
  ].join('\n\n');
}

export function resolveArtDocs(artId: string, ctx: VirtualFileContext): ResolvedComponentMeta[] {
  const { componentMetaResolver: resolver, artManifest } = ctx;

  if (!resolver) {
    throw new Error('Resolver is not ready');
  }

  const art = artManifest.find((art) => art.id === artId);

  if (!art) {
    ctx.devServer?.config.logger?.warn?.(`Unknown art id: ${artId}`);
    return [];
  }

  return art.components.map((fileName) =>
    resolveComponentDocs({
      fileName,
      resolver,
    }),
  );
}

export const artDocsVirtualFile = defineVirtualFile({
  id: VIRTUAL_DOCS.id,
  async load(ctx) {
    const artId = ctx.searchParams.get('artId');

    if (artId) {
      return renderArtDocsExport(artId, ctx);
    }

    return renderDocsModulesExport(ctx);
  },
});
