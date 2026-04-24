<script setup lang="ts">
import { computed } from 'vue';

import { useTheme } from '../composables/use-theme';

const props = defineProps<{
  width?: string | number;
}>();

const { activeTheme } = useTheme();

const logoUrl = computed(() => {
  return activeTheme.value === 'dark'
    ? 'https://assets.viyuni.top/viyuni-musea-light.svg'
    : 'https://assets.viyuni.top/viyuni-musea-dark.svg';
});
</script>

<template>
  <img
    :width="width || 130"
    class="vi:select-none vi:pointer-events-none"
    draggable="false"
    :src="logoUrl"
    alt="Viyuni Musea"
  />
</template>
