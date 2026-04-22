import type { ArtManifestCache } from '../../../types/index.ts';

export type ArtManifestUpdateEvent = 'add' | 'change' | 'unlink';

export type ArtManifestScanOptions = {
  root: string;
  patterns: string[];
  ignore: string[];
};

export type ArtManifestCacheOptions = ArtManifestScanOptions & {
  cache: ArtManifestCache;
};

export type ArtManifestCacheFileOptions = Pick<ArtManifestCacheOptions, 'cache'> & {
  root: string;
  file: string;
};
