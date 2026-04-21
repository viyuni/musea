<script setup lang="ts">
import type { ArtManifest } from '../../../types/index.ts';

defineProps<{
  art?: ArtManifest | null;
}>();
</script>

<template>
  <div class="p-6 text-center border-b border-base-content/5">
    <p class="text-[10px] font-bold uppercase tracking-widest text-base-content/30 mb-4">
      Configured Test Files
    </p>
    <div class="flex flex-wrap justify-center gap-2">
      <span
        v-for="file in art?.tests"
        :key="file"
        class="px-2 py-1 bg-base-content/5 rounded text-[10px] font-mono text-base-content/60"
      >
        {{ file }}
      </span>
    </div>
  </div>
</template>
