<script setup lang="ts">
import { Beaker } from '@lucide/vue';
</script>

<template>
  <div
    class="vi:h-full vi:flex vi:flex-col vi:items-center vi:justify-center vi:py-20 vi:px-8 vi:text-center"
  >
    <div
      class="vi:w-12 vi:h-12 vi:rounded-2xl vi:bg-base-200 vi:flex vi:items-center vi:justify-center vi:mb-4 vi:opacity-40"
    >
      <Beaker :size="24" class="vi:text-base-content" />
    </div>
    <p
      class="vi:text-[10px] vi:font-black vi:uppercase vi:tracking-[0.2em] vi:text-base-content/20 vi:mb-2"
    >
      No tests configured
    </p>
    <p class="vi:text-xs vi:text-base-content/40 vi:max-w-60 vi:leading-relaxed">
      Add a <code class="vi:bg-base-200 vi:px-1 vi:rounded">tests</code> array to your art manifest
      to enable testing.
    </p>
  </div>
</template>
