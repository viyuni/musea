<script setup lang="ts">
import { Box, Tag } from '@lucide/vue';

import type { ArtManifest } from '../../../types';

const { art } = defineProps<{ art?: ArtManifest | null }>();
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <div
      class="flex items-center gap-1 bg-base-300/40 border border-base-300 rounded px-2 py-1 text-[10px] font-bold opacity-60"
    >
      <Box class="w-3 h-3" />
      {{ art?.variants?.length || 0 }} variants
    </div>
    <div
      class="flex items-center gap-1 bg-base-300/40 border border-base-300 rounded px-2 py-1 text-[10px] font-bold opacity-60"
    >
      <Tag class="w-3 h-3" />
      {{ art?.category || 'Components' }}
    </div>

    <div
      v-for="tag in art?.tags"
      :key="tag"
      class="bg-base-300/20 border border-base-300/30 rounded px-2 py-1 text-[10px] font-bold opacity-40"
    >
      #{{ tag }}
    </div>
  </div>
</template>
