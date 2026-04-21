import type { MuseaPluginContext } from '../../types/index.ts';
import {
  createArtManifestCache,
  readArtManifestCache,
  removeArtManifestCacheEntry,
  upsertArtManifestCacheEntry,
} from './cache.ts';
import type { ArtManifestUpdateEvent } from './types.ts';

export function rebuildArtManifest(context: MuseaPluginContext) {
  context.artManifestCache = createArtManifestCache({
    root: context.root,
    patterns: context.options.patterns ?? [],
    ignore: context.options.ignore ?? [],
  });
  context.artManifest = readArtManifestCache(context.artManifestCache);
}

export function refreshArtManifest(
  context: MuseaPluginContext,
  file?: string,
  event: ArtManifestUpdateEvent = 'change',
) {
  if (!file) {
    // Fall back to a full rebuild when the caller cannot point at one changed file.
    rebuildArtManifest(context);
    return;
  }

  if (event === 'unlink') {
    removeArtManifestCacheEntry({
      cache: context.artManifestCache,
      file,
      root: context.root,
    });
  } else {
    // "add" and "change" both converge to a fresh parse of the current file contents.
    upsertArtManifestCacheEntry({
      cache: context.artManifestCache,
      file,
      root: context.root,
    });
  }

  context.artManifest = readArtManifestCache(context.artManifestCache);
}
