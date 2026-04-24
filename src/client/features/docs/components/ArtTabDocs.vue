<script setup lang="ts">
import type { ResolvedComponentMeta } from '@viyuni/vue-component-meta/types';

import type { ArtManifest } from '../../../../types';
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
    class="vi:w-full vi:animate-in vi:fade-in vi:slide-in-from-bottom-3 vi:duration-700 vi:grid vi:grid-cols-1 vi:gap-4"
  >
    <ArtDetails :art />

    <ArtMarkdownDoc v-if="art && art.docsFile" :key="art.docsFile" :art />

    <div class="vi:grid vi:grid-cols-1 vi:gap-20 vi:pb-40 vi:w-full">
      <ComponentDocs
        v-for="(item, index) in docs"
        :key="item.file"
        :resolved="item"
        :is-primary="index === 0"
      />

      <div v-if="docs?.length === 0" class="vi:grid vi:place-items-center vi:p-12 vi:text-center">
        <div class="vi:space-y-2">
          <p class="vi:text-sm vi:font-black vi:uppercase vi:tracking-[0.3em] vi:opacity-40">
            No Docs
          </p>
          <p class="vi:text-sm vi:opacity-60">This art has no component docs configured yet.</p>
        </div>
      </div>
    </div>
  </div>
</template>
