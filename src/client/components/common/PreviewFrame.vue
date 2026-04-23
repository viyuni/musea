<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core';
import {
  computed,
  onMounted,
  ref,
  useTemplateRef,
  watchEffect,
  type IframeHTMLAttributes,
} from 'vue';

type Props = /* @vue-ignore */ { src?: string; theme?: 'light' | 'dark' } & IframeHTMLAttributes;

const props = defineProps<Props>();

const iframe = useTemplateRef('iframe');
const isDark = useMediaQuery('(prefers-color-scheme: dark)');
const isLoading = ref(true);

function setTransparentBackground() {
  const doc = iframe.value?.contentDocument;

  if (!doc) return;

  doc.documentElement.style.background = 'transparent';
  doc.body.style.background = 'transparent';
}

function syncIframeTheme() {
  const doc = iframe.value?.contentDocument;

  if (!doc) return;

  setTransparentBackground();
  doc.documentElement.style.colorScheme = props.theme ?? (isDark.value ? 'dark' : 'light');
}

function handleLoad() {
  syncIframeTheme();
  isLoading.value = false;
}

function handleLoadError() {
  isLoading.value = false;
}

watchEffect(syncIframeTheme);

defineExpose({
  iframe: computed(() => iframe.value),
});

onMounted(() => {
  syncIframeTheme();
});
</script>

<template>
  <div class="relative">
    <div
      class="pointer-events-none absolute inset-0 z-10 bg-base-100 transition-opacity duration-70 ease-out"
      :class="isLoading ? 'opacity-100' : 'opacity-0'"
      aria-hidden="true"
    />

    <iframe
      ref="iframe"
      :src="src"
      frameborder="0"
      @load="handleLoad"
      @error="handleLoadError"
      v-bind="$attrs"
    />
  </div>
</template>
