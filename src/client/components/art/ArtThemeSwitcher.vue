<script setup lang="ts">
import { Sun, Moon, Monitor } from '@lucide/vue';

import { useSubTheme } from '../../composables/use-theme';

const { theme, setTheme } = useSubTheme();
</script>

<template>
  <div class="flex items-center">
    <button
      class="p-1.5 rounded-md transition-colors cursor-pointer"
      :class="[
        theme === 'auto'
          ? 'bg-base-100 shadow-sm text-primary'
          : 'text-base-content/50 hover:text-base-content',
      ]"
      title="Auto"
      @click="setTheme('auto')"
    >
      <Monitor class="w-3.5 h-3.5" />
    </button>
    <button
      class="p-1.5 rounded-md transition-colors cursor-pointer"
      :class="[
        theme === 'light'
          ? 'bg-base-100 shadow-sm text-amber-500'
          : 'text-base-content/50 hover:text-base-content',
      ]"
      title="Light"
      @click="setTheme('light')"
    >
      <Sun class="w-3.5 h-3.5" />
    </button>
    <button
      class="p-1.5 rounded-md transition-colors cursor-pointer"
      :class="[
        theme === 'dark'
          ? 'bg-base-100 shadow-sm text-indigo-400'
          : 'text-base-content/50 hover:text-base-content',
      ]"
      title="Dark"
      @click="setTheme('dark')"
    >
      <Moon class="w-3.5 h-3.5" />
    </button>
  </div>
</template>
