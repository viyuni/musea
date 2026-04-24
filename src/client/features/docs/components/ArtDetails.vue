<script setup lang="ts">
import { Box, Tag } from '@lucide/vue';

import type { ArtManifest } from '../../../../types';

const { art } = defineProps<{ art?: ArtManifest | null }>();
</script>

<template>
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
</template>
