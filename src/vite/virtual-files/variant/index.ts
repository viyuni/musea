import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { ART_VARIANT_QUERY_KEY, VIRTUAL_ART_VARIANT } from '../../../shared/constants.ts';
import { warn } from '../../../shared/logger.ts';
import { toAbsolutePath } from '../../../shared/utils.ts';
import { isArtSfc } from '../../engine/parser.ts';
import { renderArtVariant } from '../../engine/render-art-variant.ts';
import { defineVirtualFile } from '../helpers.ts';

export interface LoadArtOptions {
  file: string;
  variant?: string | null;
  sourceMap?: boolean;
}

export function loadArtVariantModule(options: LoadArtOptions) {
  const { file, variant, sourceMap = true } = options;

  if (!isArtSfc(file)) {
    return null;
  }
  const source = readFileSync(file, 'utf-8');

  return renderArtVariant(source, {
    filename: file,
    sourceMap,
    rendererVariant: variant,
  });
}

function createVariantHash(artId: string, variant?: string | null) {
  return createHash('sha1')
    .update(`${artId}:${variant ?? 'default'}`)
    .digest('hex')
    .slice(0, 8);
}

function createResolvedArtVariantId({
  artId,
  file,
  isBuild,
  searchParams,
}: {
  artId: string;
  file: string;
  isBuild: boolean;
  searchParams: URLSearchParams;
}) {
  const variant = searchParams.get('variant');
  const artDir = path.dirname(file);
  const artBaseName = path.basename(file, '.art.vue');
  const variantHash = createVariantHash(artId, variant);
  const resolvedFile = isBuild ? path.join(artDir, `${artBaseName}__${variantHash}.art.vue`) : file;

  const resolvedSearchParams = new URLSearchParams(searchParams);
  resolvedSearchParams.set(ART_VARIANT_QUERY_KEY, 'true');

  return `${resolvedFile}?${resolvedSearchParams.toString()}`;
}

export const artVariantVirtualFile = defineVirtualFile({
  id({ artManifest, isBuild, requestId, root, searchParams }) {
    if (!requestId.startsWith(VIRTUAL_ART_VARIANT.id)) {
      return;
    }

    const artId = searchParams.get('artId');

    if (!artId) {
      warn(`Missing "artId" in ${requestId}`);
      return;
    }

    const art = artManifest.find((entry) => entry.id === artId);

    if (!art) {
      warn(`Unknown art id: ${artId}`);
      return;
    }

    return createResolvedArtVariantId({
      artId,
      file: toAbsolutePath(art.file, root),
      isBuild,
      searchParams,
    });
  },
  matchLoad(_id, searchParams) {
    if (!searchParams.has(ART_VARIANT_QUERY_KEY)) {
      return null;
    }

    const query = searchParams.toString();
    return `${VIRTUAL_ART_VARIANT.id}?${query}`;
  },
  load({ addWatchFile, artManifest, root, searchParams, options: { sourceMap } }) {
    const artId = searchParams.get('artId');
    const variant = searchParams.get('variant');

    if (!artId) {
      warn(`Missing "artId" in ${VIRTUAL_ART_VARIANT.id} request`);
      return null;
    }

    const art = artManifest.find((entry) => entry.id === artId);
    if (!art) {
      warn(`Unknown art id: ${artId}`);
      return null;
    }

    const file = toAbsolutePath(art.file, root);
    addWatchFile?.(file);

    return loadArtVariantModule({ file, variant, sourceMap });
  },
});
