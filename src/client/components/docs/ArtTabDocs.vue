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
    class="ms:w-full ms:animate-in ms:fade-in ms:slide-in-from-bottom-3 ms:duration-700 ms:grid ms:grid-cols-1 ms:gap-4"
  >
    <ArtDetails :art />

    <ArtMarkdownDoc v-if="art && art.docsFile" :key="art.docsFile" :art />

    <div class="ms:grid ms:grid-cols-1 ms:gap-20 ms:pb-40 ms:w-full">
      <ComponentDocs
        v-for="(item, index) in docs"
        :key="item.file"
        :resolved="item"
        :is-primary="index === 0"
      />

      <div v-if="docs?.length === 0" class="ms:grid ms:place-items-center ms:p-12 ms:text-center">
        <div class="ms:space-y-2">
          <p class="ms:text-sm ms:font-black ms:uppercase ms:tracking-[0.3em] ms:opacity-40">
            No Docs
          </p>
          <p class="ms:text-sm ms:opacity-60">This art has no component docs configured yet.</p>
        </div>
      </div>
    </div>
  </div>
</template>
