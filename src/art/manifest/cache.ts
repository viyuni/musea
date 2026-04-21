import type { ArtManifest, ArtManifestCache } from '../../types/index.ts';
import { findArtFiles, toManifestCacheKey } from './files.ts';
import { toArtManifestEntry } from './metadata.ts';
import type { ArtManifestCacheFileOptions, ArtManifestScanOptions } from './types.ts';

function sortManifestEntries(entries: Iterable<ArtManifest>) {
  return Array.from(entries).sort((left, right) => left.id.localeCompare(right.id));
}

export function createArtManifestCache({
  root,
  patterns,
  ignore,
}: ArtManifestScanOptions): ArtManifestCache {
  const cache: ArtManifestCache = new Map();

  for (const file of findArtFiles(patterns, ignore, root)) {
    const manifestEntry = toArtManifestEntry(file, root);

    if (manifestEntry) {
      cache.set(manifestEntry.file, manifestEntry);
    }
  }

  return cache;
}

export function readArtManifestCache(cache: ArtManifestCache) {
  return sortManifestEntries(cache.values());
}

export function upsertArtManifestCacheEntry({
  cache,
  file,
  root,
}: ArtManifestCacheFileOptions): ArtManifest | undefined {
  const manifestEntry = toArtManifestEntry(file, root);

  if (!manifestEntry) {
    cache.delete(toManifestCacheKey(file, root));
    return;
  }

  cache.set(manifestEntry.file, manifestEntry);
  return manifestEntry;
}

export function removeArtManifestCacheEntry({ cache, file, root }: ArtManifestCacheFileOptions) {
  return cache.delete(toManifestCacheKey(file, root));
}

export function scanArtManifest(options: ArtManifestScanOptions): ArtManifest[] {
  return readArtManifestCache(createArtManifestCache(options));
}
