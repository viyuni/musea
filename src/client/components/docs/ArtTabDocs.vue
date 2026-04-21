<script setup lang="ts">
import type { ResolvedComponentMeta } from '@viyuni/vue-component-meta/types';

import type { ArtManifest } from '../../../types';
import ArtDetails from './ArtDetails.vue';
import ArtMarkdownDoc from './ArtMarkdownDoc.vue';
import ComponentDocs from './ComponentDocs.vue';

const { docs = [], art } = defineProps<{
  art?: ArtManifest | null;
  docs?: ResolvedComponentMeta[] | null;
}>();
</script>

<template>
  <div
    class="w-full animate-in fade-in slide-in-from-bottom-3 duration-700 grid gap-4 overflow-hidden"
  >
    <ArtDetails :art />

    <ArtMarkdownDoc v-if="art && art.docsFile" :key="art.docsFile" :art />

    <div class="grid gap-20 pb-40 overflow-hidden w-full">
      <ComponentDocs
        v-for="(item, index) in docs"
        :key="item.file"
        :resolved="item"
        :is-primary="index === 0"
      />

      <div v-if="docs?.length === 0" class="grid place-items-center p-12 text-center">
        <div class="space-y-2">
          <p class="text-sm font-black uppercase tracking-[0.3em] opacity-40">No Docs</p>
          <p class="text-sm opacity-60">This art has no component docs configured yet.</p>
        </div>
      </div>
    </div>
  </div>
</template>
