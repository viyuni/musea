<script setup lang="ts">
import type { ArtManifest } from '../../../../types/index.ts';

defineProps<{
  art?: ArtManifest | null;
}>();
</script>

<template>
  <div class="vi:p-6 vi:text-center vi:border-b vi:border-base-content/5">
    <p
      class="vi:text-[10px] vi:font-bold vi:uppercase vi:tracking-widest vi:text-base-content/30 vi:mb-4"
    >
      Configured Test Files
    </p>
    <div class="vi:flex vi:flex-wrap vi:justify-center vi:gap-2">
      <span
        v-for="file in art?.tests"
        :key="file"
        class="vi:px-2 vi:py-1 vi:bg-base-content/5 vi:rounded vi:text-[10px] vi:font-mono vi:text-base-content/60"
      >
        {{ file }}
      </span>
    </div>
  </div>
</template>
