<script setup lang="ts">
import { useTheme } from './composables/use-theme';

const { activeDataTheme } = useTheme();
</script>

<template>
  <div
    class="ms:size-screen ms:overflow-hidden ms:font-sans ms:antialiased"
    :data-theme="activeDataTheme"
  >
    <RouterView v-slot="{ Component }">
      <transition
        enter-active-class="ms:transition ms:duration-300 ms:ease-out"
        enter-from-class="ms:opacity-0 ms:translate-y-2"
        enter-to-class="ms:opacity-100 ms:translate-y-0"
        leave-active-class="ms:transition ms:duration-200 ms:ease-in"
        leave-from-class="ms:opacity-100"
        leave-to-class="ms:opacity-0"
        mode="out-in"
      >
        <component :is="Component" />
      </transition>
    </RouterView>
  </div>
</template>
