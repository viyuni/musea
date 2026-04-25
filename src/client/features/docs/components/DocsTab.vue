<script setup lang="ts">
import { Box, Tag } from '@lucide/vue';
import type { ResolvedComponentMeta } from '@viyuni/vue-component-meta/types';

import type { ArtManifest } from '../../../../types';
import MarkdownDocs from './MarkdownDocs.vue';
import MetaDocs from './MetaDocs.vue';
import VariantList from './VariantList.vue';

const { docs = [], art } = defineProps<{
  art?: ArtManifest | null;
  docs?: ResolvedComponentMeta[] | null;
}>();
</script>

<template>
  <div
    class="vi:w-full vi:animate-in vi:fade-in vi:slide-in-from-bottom-3 vi:duration-700 vi:grid vi:grid-cols-1 vi:gap-4"
  >
    <div class="vi:flex vi:flex-wrap vi:items-center vi:gap-2">
      <div
        class="vi:flex vi:items-center vi:gap-1 vi:bg-base-300/40 vi:border vi:border-base-300 vi:rounded vi:px-2 vi:py-1 vi:text-[10px] vi:font-bold vi:opacity-60"
      >
        <Box class="vi:w-3 vi:h-3" />
        {{ art?.variants?.length || 0 }} variants
      </div>
      <div
        class="vi:flex vi:items-center vi:gap-1 vi:bg-base-300/40 vi:border vi:border-base-300 vi:rounded vi:px-2 vi:py-1 vi:text-[10px] vi:font-bold vi:opacity-60"
      >
        <Tag class="vi:w-3 vi:h-3" />
        {{ art?.category || 'Components' }}
      </div>

      <div
        v-for="tag in art?.tags"
        :key="tag"
        class="vi:bg-base-300/20 vi:border vi:border-base-300/30 vi:rounded vi:px-2 vi:py-1 vi:text-[10px] vi:font-bold vi:opacity-40"
      >
        #{{ tag }}
      </div>
    </div>

    <VariantList v-if="art?.variants?.length" :art class="vi:mt-4 vi:mb-8" />

    <MarkdownDocs v-if="art && art.docsFile" :key="art.docsFile" :art />

    <div class="vi:grid vi:grid-cols-1 vi:gap-20 vi:pb-40 vi:w-full">
      <MetaDocs
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
