import { manifest, artModules } from 'virtual:musea-manifest';
import { computed, defineAsyncComponent, shallowRef } from 'vue';

import { MUSEA_HOT_EVENTS, VIRTUAL_ART_MANIFEST } from '../../../../shared/constants';
import type { ArtManifest } from '../../../../types';

type Manifest = typeof manifest;
type ArtModules = typeof artModules;

type ResolvedArtModule = {
  component: unknown;
  variants: Record<string, unknown>;
};

type ArtBundleModule = {
  default: Record<string, ResolvedArtModule>;
};

type ManifestVirtualModule = {
  manifest: Manifest;
  artModules: ArtModules;
};

const manifestVirtualModule = shallowRef<ManifestVirtualModule>({
  manifest,
  artModules,
});

const loadedArtModules = new Map<string, Promise<ResolvedArtModule>>();

const arts = computed<ArtManifest[]>(() => manifestVirtualModule.value.manifest);

async function reloadManifestVirtualModule(timestamp: number) {
  const query = new URLSearchParams({
    t: String(timestamp),
  }).toString();

  return await import(
    /* @vite-ignore */
    `${VIRTUAL_ART_MANIFEST.url}?${query}`
  );
}

async function updateManifestVirtualModule(timestamp: number) {
  const module = await reloadManifestVirtualModule(timestamp);
  manifestVirtualModule.value = module as ManifestVirtualModule;
  loadedArtModules.clear();
}

async function loadArtModule(artId: string) {
  const cached = loadedArtModules.get(artId);

  if (cached) {
    return await cached;
  }

  const loader = manifestVirtualModule.value.artModules[artId];
  if (!loader) throw new Error('Unknown art id: ' + artId);

  const modulePromise = loader().then((module: unknown) => {
    const artBundle = (module as ArtBundleModule).default;
    const resolved = artBundle?.[artId];

    if (!resolved) {
      throw new Error('Missing bundled art module for art id: ' + artId);
    }

    return resolved;
  });

  loadedArtModules.set(artId, modulePromise);
  return await modulePromise;
}

if (import.meta.hot) {
  const onManifestUpdate = (payload?: { timestamp?: number }) => {
    void updateManifestVirtualModule(payload?.timestamp ?? Date.now());
  };

  import.meta.hot.on(MUSEA_HOT_EVENTS.manifestUpdate, onManifestUpdate);
  import.meta.hot.dispose(() => {
    import.meta.hot?.off(MUSEA_HOT_EVENTS.manifestUpdate, onManifestUpdate);
  });
}

export async function loadArt(artId: string) {
  return await loadArtModule(artId);
}

export async function loadArtComponent(artId: string) {
  return (await loadArt(artId)).component;
}

export async function loadArtVariant(artId: string, variant?: string) {
  const variantComponent = (await loadArt(artId)).variants?.[variant ?? ''];

  if (!variantComponent) {
    throw new Error('Unknown art variant');
  }

  return variantComponent;
}

export function getVariantComponent(artId?: string, variant?: string) {
  return defineAsyncComponent(async () => {
    if (!artId) {
      return Promise.reject(new Error('missing art id.'));
    }

    return await loadArtVariant(artId, variant);
  });
}

export const useArtManifest = () => {
  /**
   * Group arts by their category (case-insensitive).
   * Defaults to 'COMPONENTS' if category is missing.
   */
  const groupedArts = computed(() => {
    const groups: Record<string, typeof arts.value> = {};

    arts.value.forEach((art) => {
      const categoryKey = (art.category || 'COMPONENTS').toUpperCase();

      if (!groups[categoryKey]) {
        groups[categoryKey] = [];
      }
      groups[categoryKey].push(art);
    });

    return groups;
  });

  /**
   * Total number of variants across all art items.
   */
  const totalVariants = computed(() => {
    return arts.value.reduce((sum, art) => sum + (art.variants?.length ?? 0), 0);
  });

  /**
   * Number of unique categories available.
   */
  const categoryCount = computed(() => Object.keys(groupedArts.value).length);

  /**
   * Total number of base art items.
   */
  const totalArts = computed(() => arts.value.length);

  return {
    arts,
    groupedArts,
    totalVariants,
    categoryCount,
    totalArts,
  };
};
