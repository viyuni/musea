import type { ArtManifestCache } from '../../../types/index.ts';

export type ArtManifestUpdateEvent = 'add' | 'change' | 'unlink';

export type ArtManifestScanOptions = {
  root: string;
  patterns: string[];
  ignore: string[];
};

export type ArtManifestCacheFileOptions = {
  cache: ArtManifestCache;
  root: string;
  file: string;
};
