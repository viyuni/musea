import type { ResolvedComponentMeta } from '@viyuni/vue-component-meta/types';
import { docsModules } from 'virtual:musea-docs';
import { shallowRef, toValue, watchEffect, type MaybeRefOrGetter } from 'vue';

import { MUSEA_HOT_EVENTS, VIRTUAL_DOCS } from '../../shared/constants';

type DocsModules = typeof docsModules;
type ArtDocsModule = Awaited<ReturnType<DocsModules[string]>>;

const docsVirtualModule = shallowRef<DocsModules>(docsModules);

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
  ).then((module) => module.docsModules as DocsModules);
}

async function updateDocsVirtualModule(timestamp: number) {
  docsVirtualModule.value = await reloadDocsVirtualModule(timestamp);
}

async function reloadArtDocsModule(id: string, timestamp: number) {
  const query = createDocsQuery({
    artId: id,
    t: String(timestamp),
  });

  return await import(
    /* @vite-ignore */
    `${VIRTUAL_DOCS.url}?${query}`
  ).then((module) => module as ArtDocsModule);
}

function shouldRefreshArtDoc(currentArtId: string | undefined, affectedArtIds?: string[]) {
  if (!currentArtId) return false;
  if (!affectedArtIds?.length) return true;

  return affectedArtIds.includes(currentArtId);
}

export async function loadArtDoc(id: string) {
  const loader = docsVirtualModule.value[id];
  if (!loader) throw new Error('Unknown art id: ' + id);

  return await loader().then((module: ArtDocsModule) => module.docs.meta);
}

export async function loadArtMarkdownDoc(artId: string) {
  if (import.meta.hot) {
    return await reloadArtDocsModule(artId, Date.now()).then((module) => module.docs.markdown);
  }

  const loader = docsVirtualModule.value[artId];
  return await loader?.().then((module: ArtDocsModule) => module.docs.markdown);
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
      ? reloadArtDocsModule(artId, timestamp).then((module) => module.docs.meta)
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
