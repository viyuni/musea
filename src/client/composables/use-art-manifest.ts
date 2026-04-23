import { manifest, artModules, componentModules } from 'virtual:musea-manifest';
import { computed, defineAsyncComponent, shallowRef } from 'vue';

import { MUSEA_HOT_EVENTS, VIRTUAL_ART_MANIFEST } from '../../shared/constants';
import type { ArtManifest } from '../../types';

type Manifest = typeof manifest;
type ArtModules = typeof artModules;
type ComponentModules = typeof componentModules;

type ManifestVirtualModule = {
  manifest: Manifest;
  artModules: ArtModules;
  componentModules: ComponentModules;
};

const manifestVirtualModule = shallowRef<ManifestVirtualModule>({
  manifest,
  artModules,
  componentModules,
});

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

export function getArtComponent(artId?: string) {
  return defineAsyncComponent(() => {
    if (!artId) {
      return Promise.reject(new Error('missing art id.'));
    }

    const loader = manifestVirtualModule.value.artModules?.[artId];
    if (!loader) throw new Error('Unknown art variant');

    return loader();
  });
}

export function loadComponentPreview(artId: string) {
  const loader = manifestVirtualModule.value.componentModules[artId];
  if (!loader) throw new Error('Unknown art id: ' + artId);

  return loader();
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
