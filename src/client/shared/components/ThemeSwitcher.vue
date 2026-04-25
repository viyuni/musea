<script setup lang="ts">
import { Sun, Moon, Monitor } from '@lucide/vue';

import { useSubTheme } from '../composables/use-theme';

const { theme, setTheme } = useSubTheme();
</script>

<template>
  <div class="vi:flex vi:items-center">
    <button
      class="vi:p-1.5 vi:rounded-md vi:transition-colors vi:cursor-pointer"
      :class="[
        theme === 'auto'
          ? 'vi:bg-base-100 vi:shadow-sm vi:text-primary'
          : 'vi:text-base-content/50 vi:hover:text-base-content',
      ]"
      title="Auto"
      @click="setTheme('auto')"
    >
      <Monitor class="vi:w-3.5 vi:h-3.5" />
    </button>
    <button
      class="vi:p-1.5 vi:rounded-md vi:transition-colors vi:cursor-pointer"
      :class="[
        theme === 'light'
          ? 'vi:bg-base-100 vi:shadow-sm vi:text-amber-500'
          : 'vi:text-base-content/50 vi:hover:text-base-content',
      ]"
      title="Light"
      @click="setTheme('light')"
    >
      <Sun class="vi:w-3.5 vi:h-3.5" />
    </button>
    <button
      class="vi:p-1.5 vi:rounded-md vi:transition-colors vi:cursor-pointer"
      :class="[
        theme === 'dark'
          ? 'vi:bg-base-100 vi:shadow-sm vi:text-indigo-400'
          : 'vi:text-base-content/50 vi:hover:text-base-content',
      ]"
      title="Dark"
      @click="setTheme('dark')"
    >
      <Moon class="vi:w-3.5 vi:h-3.5" />
    </button>
  </div>
</template>
