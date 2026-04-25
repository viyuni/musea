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
  filename?: string;
  variant?: string | null;
  sourceMap?: boolean;
}

export function loadArtModule(options: LoadArtOptions) {
  const { file, filename = file, variant, sourceMap = true } = options;

  if (!isArtSfc(file)) {
    return null;
  }
  const source = readFileSync(file, 'utf-8');

  return renderArtVariant(source, {
    filename,
    sourceMap,
    rendererVariant: variant,
  });
}

function normalizeVariantName(variant?: string | null) {
  return variant || 'default';
}

function createVariantHash(artId: string, variant?: string | null) {
  return createHash('sha1')
    .update(`${artId}:${normalizeVariantName(variant)}`)
    .digest('hex')
    .slice(0, 8);
}

function createVariantFilename(file: string, artId: string, variant?: string | null) {
  const artDir = path.dirname(file);
  const artBaseName = path.basename(file, '.art.vue');
  const variantHash = createVariantHash(artId, variant);
  return path.join(artDir, `${artBaseName}__${variantHash}.art.vue`);
}

function createResolvedArtVariantId({
  artId,
  file,
  searchParams,
}: {
  artId: string;
  file: string;
  searchParams: URLSearchParams;
}) {
  const variant = searchParams.get('variant');
  const resolvedFile = createVariantFilename(file, artId, variant);

  const resolvedSearchParams = new URLSearchParams(searchParams);
  resolvedSearchParams.set(ART_VARIANT_QUERY_KEY, 'true');

  return `${resolvedFile}?${resolvedSearchParams.toString()}`;
}

export const artVariantVirtualFile = defineVirtualFile({
  id({ artManifest, requestId, root, searchParams }) {
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

    return loadArtModule({
      file,
      filename: createVariantFilename(file, artId, variant),
      variant,
      sourceMap,
    });
  },
});
