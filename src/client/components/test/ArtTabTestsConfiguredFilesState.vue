<script setup lang="ts">
import type { ArtManifest } from '../../../types/index.ts';

defineProps<{
  art?: ArtManifest | null;
}>();
</script>

<template>
  <div class="ms:p-6 ms:text-center ms:border-b ms:border-base-content/5">
    <p
      class="ms:text-[10px] ms:font-bold ms:uppercase ms:tracking-widest ms:text-base-content/30 ms:mb-4"
    >
      Configured Test Files
    </p>
    <div class="ms:flex ms:flex-wrap ms:justify-center ms:gap-2">
      <span
        v-for="file in art?.tests"
        :key="file"
        class="ms:px-2 ms:py-1 ms:bg-base-content/5 ms:rounded ms:text-[10px] ms:font-mono ms:text-base-content/60"
      >
        {{ file }}
      </span>
    </div>
  </div>
</template>
