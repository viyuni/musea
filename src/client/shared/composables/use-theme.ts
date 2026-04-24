import { createSharedComposable, useLocalStorage, useMediaQuery } from '@vueuse/core';
import { watchEffect, computed } from 'vue';

import type { ThemeMode } from '../../types';

export type ThemeName = `musea-${Exclude<ThemeMode, 'auto'>}`;

function toThemeName(theme: Exclude<ThemeMode, 'auto'>): ThemeName {
  return `musea-${theme}`;
}

function applyTheme(theme: ThemeName) {
  const appEl = document.querySelector('#musea-app');

  appEl?.setAttribute('data-theme', theme);
}

export const useTheme = createSharedComposable(() => {
  const theme = useLocalStorage<ThemeMode>('musea-theme', 'auto');
  const isSystemDark = useMediaQuery('(prefers-color-scheme: dark)');

  const activeTheme = computed(() => {
    if (theme.value === 'auto') {
      return isSystemDark.value ? 'dark' : 'light';
    }
    return theme.value;
  });
  const activeDataTheme = computed(() => toThemeName(activeTheme.value));

  watchEffect(() => {
    applyTheme(activeDataTheme.value);
  });

  return {
    theme,
    activeTheme,
    activeDataTheme,
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
  const activeDataTheme = computed(() => toThemeName(activeTheme.value));

  return {
    theme,
    activeTheme,
    activeDataTheme,
    setTheme: (val: ThemeMode) => (theme.value = val),
  };
});
