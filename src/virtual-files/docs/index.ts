import type { ResolvedComponentMeta } from '@viyuni/vue-component-meta/types';
import type { SetRequired } from 'type-fest';

import { resolveComponentDocs } from '../../art/resolve-component-doc.ts';
import { VIRTUAL_DOCS } from '../../shared/constants.ts';
import type { ArtManifest, VirtualFileContext } from '../../types/index.ts';
import {
  createConstExport,
  createImport,
  defineVirtualFile,
  normalizeForImport,
  renderObjectLiteral,
  serializeModuleValue,
} from '../core/index.ts';

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

function renderMarkdownDocsModulesExport({ artManifest, root }: VirtualFileContext) {
  return createConstExport(
    'markdownDocsModules',
    renderObjectLiteral(
      artManifest
        .filter((art): art is SetRequired<ArtManifest, 'docsFile'> => Boolean(art.docsFile))
        .map(
          (art) =>
            `${JSON.stringify(art.id)}: ${createImport(normalizeForImport(art.docsFile, root))}`,
        ),
    ),
  );
}

export function resolveArtDocs(artId: string, ctx: VirtualFileContext): ResolvedComponentMeta[] {
  const { componentMetaResolver: resolver, artManifest } = ctx;

  if (!resolver) {
    throw new Error('Resolver is not ready');
  }

  const art = artManifest.find((art) => art.id === artId);

  if (!art) {
    throw new Error(`Unknown art id: ${artId}`);
  }

  const primaryFile = art.components[0];

  if (!primaryFile) {
    throw new Error(`Missing primary component for art id: ${artId}`);
  }

  return [
    resolveComponentDocs({
      fileName: primaryFile,
      resolver,
    }),
    ...art.components.slice(1).map((fileName) =>
      resolveComponentDocs({
        fileName,
        resolver,
      }),
    ),
  ];
}

export function renderDocsDetails(artId: string, ctx: VirtualFileContext) {
  const docs = resolveArtDocs(artId, ctx);
  return createConstExport('docs', serializeModuleValue(docs));
}

export const artDocsVirtualFile = defineVirtualFile({
  id: VIRTUAL_DOCS.id,
  async load(ctx) {
    const artId = ctx.searchParams.get('artId');

    if (artId) {
      return renderDocsDetails(artId, ctx);
    }

    return [renderDocsModulesExport(ctx), renderMarkdownDocsModulesExport(ctx)].join('\n\n');
  },
});
