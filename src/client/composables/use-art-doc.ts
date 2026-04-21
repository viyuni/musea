import type { ResolvedComponentMeta } from '@viyuni/vue-component-meta/types';
import { docsModules, markdownDocsModules } from 'virtual:musea-docs';
import { shallowRef, toValue, watchEffect, type MaybeRefOrGetter } from 'vue';

import { MUSEA_HOT_EVENTS, VIRTUAL_DOCS } from '../../shared/constants';

type DocsModules = typeof docsModules;
type MarkdownDocsModules = typeof markdownDocsModules;

type DocsVirtualModule = {
  docsModules: DocsModules;
  markdownDocsModules: MarkdownDocsModules;
};

const docsVirtualModule = shallowRef<DocsVirtualModule>({
  docsModules,
  markdownDocsModules,
});

function createDocsQuery(params: Record<string, string>) {
  return new URLSearchParams(params).toString();
}

async function reloadDocsVirtualModule(timestamp: number) {
  const query = createDocsQuery({
    t: String(timestamp),
  });

  return await import(
    /* @vite-ignore */
    `${VIRTUAL_DOCS.url}?${query}`
  );
}

async function reloadArtDoc(id: string, timestamp: number) {
  const query = createDocsQuery({
    artId: id,
    t: String(timestamp),
  });

  return await import(
    /* @vite-ignore */
    `${VIRTUAL_DOCS.url}?${query}`
  ).then((module) => module.docs);
}

async function updateDocsVirtualModule(timestamp: number) {
  const module = await reloadDocsVirtualModule(timestamp);
  docsVirtualModule.value = module as DocsVirtualModule;
}

function shouldRefreshArtDoc(currentArtId: string | undefined, affectedArtIds?: string[]) {
  if (!currentArtId) return false;
  if (!affectedArtIds?.length) return true;

  return affectedArtIds.includes(currentArtId);
}

export async function loadArtDoc(id: string) {
  const loader = docsVirtualModule.value.docsModules[id];
  if (!loader) throw new Error('Unknown art id: ' + id);

  return await loader().then((module) => module.docs);
}

export async function loadArtMarkdownDoc(artId: string) {
  if (import.meta.hot) {
    await updateDocsVirtualModule(Date.now());
  }

  const loader = docsVirtualModule.value.markdownDocsModules[artId];
  return await loader?.();
}

export const useArtDoc = (id: MaybeRefOrGetter<string | undefined>) => {
  const artDoc = shallowRef<ResolvedComponentMeta[]>();

  async function refreshArtDoc(timestamp = Date.now()) {
    const artId = toValue(id);

    if (!artId) {
      artDoc.value = undefined;
      return;
    }

    artDoc.value = (await (import.meta.hot
      ? reloadArtDoc(artId, timestamp)
      : loadArtDoc(artId))) as ResolvedComponentMeta[];
  }

  watchEffect(() => {
    void refreshArtDoc();
  });

  if (import.meta.hot) {
    const onDocsUpdate = (payload?: {
      timestamp?: number;
      affectedArtIds?: string[];
      file?: string;
    }) => {
      const timestamp = payload?.timestamp ?? Date.now();
      const affectedArtIds = payload?.affectedArtIds;
      const currentArtId = toValue(id);
      void (async () => {
        await updateDocsVirtualModule(timestamp);

        if (shouldRefreshArtDoc(currentArtId, affectedArtIds)) {
          await refreshArtDoc(timestamp);
        }
      })();
    };

    import.meta.hot.on(MUSEA_HOT_EVENTS.docsUpdate, onDocsUpdate);
    import.meta.hot.dispose(() => {
      import.meta.hot?.off(MUSEA_HOT_EVENTS.docsUpdate, onDocsUpdate);
    });
  }

  return { artDoc };
};
