<script setup lang="ts">
import { AlertCircle } from '@lucide/vue';

defineProps<{
  runError: string;
}>();
</script>

<template>
  <div
    class="ms:m-4 ms:p-4 ms:rounded-lg ms:bg-error/5 ms:border ms:border-error/10 ms:flex ms:gap-3"
  >
    <AlertCircle :size="16" class="ms:text-error ms:shrink-0" />
    <div class="ms:space-y-1">
      <p class="ms:text-xs ms:font-bold ms:text-error ms:uppercase ms:tracking-widest">Run Error</p>
      <p class="ms:text-xs ms:text-error/80 ms:leading-relaxed">{{ runError }}</p>
    </div>
  </div>
</template>
