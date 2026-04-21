<script setup lang="ts">
import { Beaker } from '@lucide/vue';
</script>

<template>
  <div class="h-full flex flex-col items-center justify-center py-20 px-8 text-center">
    <div class="w-12 h-12 rounded-2xl bg-base-200 flex items-center justify-center mb-4 opacity-40">
      <Beaker :size="24" class="text-base-content" />
    </div>
    <p class="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/20 mb-2">
      No tests configured
    </p>
    <p class="text-xs text-base-content/40 max-w-[240px] leading-relaxed">
      Add a <code class="bg-base-200 px-1 rounded">tests</code> array to your art manifest to enable
      testing.
    </p>
  </div>
</template>
