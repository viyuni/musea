import { createSharedComposable, useLocalStorage, useMediaQuery } from '@vueuse/core';
import { watchEffect, computed } from 'vue';

import type { ThemeMode } from '../types';

export const useTheme = createSharedComposable(() => {
  const theme = useLocalStorage<ThemeMode>('musea-theme', 'auto');
  const isSystemDark = useMediaQuery('(prefers-color-scheme: dark)');

  const activeTheme = computed(() => {
    if (theme.value === 'auto') {
      return isSystemDark.value ? 'dark' : 'light';
    }
    return theme.value;
  });

  watchEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme.value);
  });

  return {
    theme,
    activeTheme,
    setTheme: (val: ThemeMode) => (theme.value = val),
  };
});

export const useSubTheme = createSharedComposable(() => {
  const theme = useLocalStorage<ThemeMode>('musea-sub-theme', 'auto');
  const { activeTheme: globalActiveTheme } = useTheme();

  const activeTheme = computed(() => {
    if (theme.value === 'auto') {
      return globalActiveTheme.value;
    }
    return theme.value;
  });

  return {
    theme,
    activeTheme,
    setTheme: (val: ThemeMode) => (theme.value = val),
  };
});
