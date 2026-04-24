<script setup lang="ts">
import { Beaker } from '@lucide/vue';
</script>

<template>
  <div
    class="ms:h-full ms:flex ms:flex-col ms:items-center ms:justify-center ms:py-20 ms:px-8 ms:text-center"
  >
    <div
      class="ms:w-12 ms:h-12 ms:rounded-2xl ms:bg-base-200 ms:flex ms:items-center ms:justify-center ms:mb-4 ms:opacity-40"
    >
      <Beaker :size="24" class="ms:text-base-content" />
    </div>
    <p
      class="ms:text-[10px] ms:font-black ms:uppercase ms:tracking-[0.2em] ms:text-base-content/20 ms:mb-2"
    >
      No tests configured
    </p>
    <p class="ms:text-xs ms:text-base-content/40 ms:max-w-60 ms:leading-relaxed">
      Add a <code class="ms:bg-base-200 ms:px-1 ms:rounded">tests</code> array to your art manifest
      to enable testing.
    </p>
  </div>
</template>
