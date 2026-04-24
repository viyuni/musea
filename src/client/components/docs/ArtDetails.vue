<script setup lang="ts">
import { Box, Tag } from '@lucide/vue';

import type { ArtManifest } from '../../../types';

const { art } = defineProps<{ art?: ArtManifest | null }>();
</script>

<template>
  <div class="ms:flex ms:flex-wrap ms:items-center ms:gap-2">
    <div
      class="ms:flex ms:items-center ms:gap-1 ms:bg-base-300/40 ms:border ms:border-base-300 ms:rounded ms:px-2 ms:py-1 ms:text-[10px] ms:font-bold ms:opacity-60"
    >
      <Box class="ms:w-3 ms:h-3" />
      {{ art?.variants?.length || 0 }} variants
    </div>
    <div
      class="ms:flex ms:items-center ms:gap-1 ms:bg-base-300/40 ms:border ms:border-base-300 ms:rounded ms:px-2 ms:py-1 ms:text-[10px] ms:font-bold ms:opacity-60"
    >
      <Tag class="ms:w-3 ms:h-3" />
      {{ art?.category || 'Components' }}
    </div>

    <div
      v-for="tag in art?.tags"
      :key="tag"
      class="ms:bg-base-300/20 ms:border ms:border-base-300/30 ms:rounded ms:px-2 ms:py-1 ms:text-[10px] ms:font-bold ms:opacity-40"
    >
      #{{ tag }}
    </div>
  </div>
</template>
