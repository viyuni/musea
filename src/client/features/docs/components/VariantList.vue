<script setup lang="ts">
import type { ArtManifest } from '../../../../types/index.ts';
import VariantRender from './VariantRender.vue';

const props = defineProps<{
  art: ArtManifest;
}>();
</script>

<template>
  <div class="vi:grid vi:gap-10">
    <div
      v-for="variant in art?.variants"
      :key="variant.name"
      class="vi:border vi:border-base-200 vi:rounded-lg vi:p-4 vi:overflow-hidden"
    >
      <header class="vi:mb-2">
        <div class="vi:flex vi:items-center vi:gap-2 vi:mb-1">
          <h3 class="vi:text-sm vi:font-bold vi:opacity-80 vi:uppercase vi:tracking-wider">
            {{ variant.name }}
          </h3>
        </div>

        <div class="vi:text-base-content/60 vi:text-sm">
          {{ variant.description }}
        </div>
      </header>

      <VariantRender
        :key="`${art.id}:${variant.name}`"
        :art-id="art.id"
        :variant-name="variant.name"
      />
    </div>
  </div>
</template>
