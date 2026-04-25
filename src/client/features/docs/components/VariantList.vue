<script setup lang="ts">
import { useTemplateRef } from 'vue';

import type { ArtManifest } from '../../../../types/index.ts';
import VariantRender from './VariantFrame.vue';

const props = defineProps<{
  art: ArtManifest;
}>();
</script>

<template>
  <div ref="containerRef" class="vi:grid vi:gap-10">
    <div
      v-for="variant in art?.variants"
      :key="variant.name"
      class="vi:border vi:border-base-300 vi:rounded-md vi:p-4 vi:overflow-hidden"
    >
      <header class="vi:mb-2">
        <div class="vi:flex vi:items-center vi:gap-2 vi:mb-1">
          <h3 class="vi:text-sm vi:font-bold vi:opacity-80 vi:uppercase vi:tracking-wider">
            {{ variant.name }}
          </h3>
          <span
            v-if="variant.default"
            class="vi:px-1.5 vi:py-0.5 vi:rounded vi:bg-primary/10 vi:text-primary vi:text-[10px] vi:font-bold vi:uppercase"
          >
            Default
          </span>
        </div>

        <div class="vi:text-base-content/60 vi:text-sm">
          {{ variant.description }}
        </div>
      </header>

      <div>
        <VariantRender :art-id="art.id" :variant="variant.name" />
      </div>
    </div>
  </div>
</template>
