<script setup lang="ts">
import { AlertCircle } from '@lucide/vue';

defineProps<{
  runError: string;
}>();
</script>

<template>
  <div
    class="vi:m-4 vi:p-4 vi:rounded-lg vi:bg-error/5 vi:border vi:border-error/10 vi:flex vi:gap-3"
  >
    <AlertCircle :size="16" class="vi:text-error vi:shrink-0" />
    <div class="vi:space-y-1">
      <p class="vi:text-xs vi:font-bold vi:text-error vi:uppercase vi:tracking-widest">Run Error</p>
      <p class="vi:text-xs vi:text-error/80 vi:leading-relaxed">{{ runError }}</p>
    </div>
  </div>
</template>
