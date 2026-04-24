<script setup lang="ts">
import { useTheme } from './shared/composables/use-theme';

const { activeDataTheme } = useTheme();
</script>

<template>
  <div
    class="vi:size-screen vi:overflow-hidden vi:font-sans vi:antialiased"
    :data-theme="activeDataTheme"
  >
    <RouterView v-slot="{ Component }">
      <transition
        enter-active-class="vi:transition vi:duration-300 vi:ease-out"
        enter-from-class="vi:opacity-0 vi:translate-y-2"
        enter-to-class="vi:opacity-100 vi:translate-y-0"
        leave-active-class="vi:transition vi:duration-200 vi:ease-in"
        leave-from-class="vi:opacity-100"
        leave-to-class="vi:opacity-0"
        mode="out-in"
      >
        <component :is="Component" />
      </transition>
    </RouterView>
  </div>
</template>
