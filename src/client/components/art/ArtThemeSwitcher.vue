<script setup lang="ts">
import { Sun, Moon, Monitor } from '@lucide/vue';

import { useSubTheme } from '../../composables/use-theme';

const { theme, setTheme } = useSubTheme();
</script>

<template>
  <div class="ms:flex ms:items-center">
    <button
      class="ms:p-1.5 ms:rounded-md ms:transition-colors ms:cursor-pointer"
      :class="[
        theme === 'auto'
          ? 'ms:bg-base-100 ms:shadow-sm ms:text-primary'
          : 'ms:text-base-content/50 ms:hover:text-base-content',
      ]"
      title="Auto"
      @click="setTheme('auto')"
    >
      <Monitor class="ms:w-3.5 ms:h-3.5" />
    </button>
    <button
      class="ms:p-1.5 ms:rounded-md ms:transition-colors ms:cursor-pointer"
      :class="[
        theme === 'light'
          ? 'ms:bg-base-100 ms:shadow-sm ms:text-amber-500'
          : 'ms:text-base-content/50 ms:hover:text-base-content',
      ]"
      title="Light"
      @click="setTheme('light')"
    >
      <Sun class="ms:w-3.5 ms:h-3.5" />
    </button>
    <button
      class="ms:p-1.5 ms:rounded-md ms:transition-colors ms:cursor-pointer"
      :class="[
        theme === 'dark'
          ? 'ms:bg-base-100 ms:shadow-sm ms:text-indigo-400'
          : 'ms:text-base-content/50 ms:hover:text-base-content',
      ]"
      title="Dark"
      @click="setTheme('dark')"
    >
      <Moon class="ms:w-3.5 ms:h-3.5" />
    </button>
  </div>
</template>
