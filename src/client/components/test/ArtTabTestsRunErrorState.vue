<script setup lang="ts">
import { AlertCircle } from '@lucide/vue';

defineProps<{
  runError: string;
}>();
</script>

<template>
  <div class="m-4 p-4 rounded-lg bg-error/5 border border-error/10 flex gap-3">
    <AlertCircle :size="16" class="text-error shrink-0" />
    <div class="space-y-1">
      <p class="text-xs font-bold text-error uppercase tracking-widest">Run Error</p>
      <p class="text-xs text-error/80 leading-relaxed">{{ runError }}</p>
    </div>
  </div>
</template>
