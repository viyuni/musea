<script setup lang="ts">
import { RotateCcw, ZoomIn, ZoomOut, SquareMousePointer } from '@lucide/vue';
import { watchImmediate } from '@vueuse/core';
import { computed, onBeforeUnmount, ref, toRaw, useTemplateRef, watchEffect } from 'vue';

import { useSubTheme } from '../../composables/use-theme';
import { createInspectorMessage } from '../../messages/preview';

const props = withDefaults(
  defineProps<{
    url: string;
    heightMode?: 'adaptive' | 'auto';
    minHeight?: number;
    maxHeight?: number;
  }>(),
  {
    heightMode: 'adaptive',
    minHeight: 60,
    maxHeight: 720,
  },
);

const isDev = import.meta.env.DEV;
const containerPPadding = 8;
const zoom = ref(1);
const isLoading = ref(true);
const iframe = useTemplateRef('iframe');
const queuedMessages = ref<unknown[]>([]);
const adaptiveHeight = ref<number | null>(null);
const { activeTheme, activeDataTheme } = useSubTheme();
let frameResizeObserver: ResizeObserver | null = null;

const isAutoHeight = computed(() => props.heightMode === 'auto');
const iframeStyle = computed(() => {
  if (isAutoHeight.value) {
    return undefined;
  }

  return {
    height: `${adaptiveHeight.value ?? props.minHeight}px`,
  };
});

function teardownFrameObserver() {
  frameResizeObserver?.disconnect();
  frameResizeObserver = null;
}

function measureAdaptiveHeight() {
  if (isAutoHeight.value) {
    return;
  }

  const doc = iframe.value?.contentDocument;

  if (!doc) return;

  const docEle = doc.documentElement;
  const body = doc.body;
  const rawHeight = Math.max(
    docEle.scrollHeight,
    docEle.offsetHeight,
    body?.scrollHeight ?? 0,
    body?.offsetHeight ?? 0,
  );

  if (!rawHeight) return;

  adaptiveHeight.value = Math.min(props.maxHeight, Math.max(props.minHeight, rawHeight));
}

function observeAdaptiveHeight() {
  teardownFrameObserver();
  measureAdaptiveHeight();

  if (isAutoHeight.value || typeof ResizeObserver === 'undefined') {
    return;
  }

  const doc = iframe.value?.contentDocument;

  if (!doc) return;

  frameResizeObserver = new ResizeObserver(() => {
    measureAdaptiveHeight();
  });

  frameResizeObserver.observe(doc.documentElement);

  if (doc.body) {
    frameResizeObserver.observe(doc.body);
  }
}

function syncIframeTheme() {
  const doc = iframe.value?.contentDocument;

  if (!doc) return;

  doc.documentElement.style.colorScheme = activeTheme.value;
  doc.documentElement.style.background = 'transparent';
  doc.body.style.background = 'transparent';
}

function setZoom(value: number) {
  const normalizedZoom = Math.max(0.1, Number(value.toFixed(2)));
  const docEle = iframe.value?.contentDocument?.documentElement;

  zoom.value = normalizedZoom;

  if (docEle) {
    docEle.style.zoom = normalizedZoom.toString();
  }
}

function zoomIn() {
  setZoom(zoom.value + 0.1);
}

function zoomOut() {
  setZoom(zoom.value - 0.1);
}

function resetZoom() {
  setZoom(1);
}

function handleIframeLoad() {
  syncIframeTheme();
  observeAdaptiveHeight();
  isLoading.value = false;
  flushPostedMessages();
}

function flushPostedMessages() {
  const frameWindow = iframe.value?.contentWindow;

  if (!frameWindow) return;

  for (const message of queuedMessages.value) {
    frameWindow.postMessage(toStructuredCloneSafe(message), '*');
  }

  queuedMessages.value = [];
}

function postMessage(message: unknown) {
  if (isLoading.value) {
    queuedMessages.value = [...queuedMessages.value, message];
    return;
  }

  iframe.value?.contentWindow?.postMessage(toStructuredCloneSafe(message), '*');
}

function toStructuredCloneSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(toRaw(value))) as T;
}

function resetPreviewState() {
  teardownFrameObserver();
  adaptiveHeight.value = null;
  isLoading.value = Boolean(props.url);
  queuedMessages.value = [];
}

function openInspector() {
  postMessage(createInspectorMessage());
}

watchImmediate(() => props.url, resetPreviewState);
watchEffect(measureAdaptiveHeight);

watchEffect(syncIframeTheme);

onBeforeUnmount(teardownFrameObserver);

defineExpose({
  postMessage,
});
</script>

<template>
  <div
    class="vi:w-full vi:overflow-hidden vi:relative vi:group vi:transition-none"
    :class="isAutoHeight ? 'vi:h-full' : 'vi:h-auto'"
    :data-theme="activeDataTheme"
    :style="{
      padding: `${containerPPadding}px`,
      backgroundImage: `radial-gradient(
        circle at 1px 1px,
        var(--color-base-300) 1px,
        transparent 0
      )`,
      backgroundSize: '10px 10px',
    }"
  >
    <Transition
      mode="out-in"
      enter-active-class="vi:transition-opacity vi:duration-80 vi:ease-out"
      enter-from-class="vi:opacity-0"
      enter-to-class="vi:opacity-100"
      leave-active-class="vi:transition-opacity vi:duration-80 vi:ease-in"
      leave-from-class="vi:opacity-100"
      leave-to-class="vi:opacity-0"
    >
      <div
        v-if="isLoading"
        class="vi:absolute vi:left-0 vi:top-0 vi:size-full vi:inset-4 vi:z-10 vi:flex vi:items-center vi:justify-center vi:bg-base-100 vi:backdrop-blur-sm"
      />
    </Transition>

    <iframe
      :key="props.url"
      ref="iframe"
      :src="props.url"
      class="vi:border-none vi:block vi:w-full"
      :class="isAutoHeight ? 'h-full' : ''"
      :style="iframeStyle"
      @load="handleIframeLoad"
    ></iframe>

    <div
      class="vi:absolute vi:bottom-2 vi:right-2 vi:flex vi:items-center vi:gap-2 vi:transition-opacity vi:opacity-0 vi:group-hover:opacity-100"
    >
      <button
        class="vi:vi-btn vi:vi-btn-ghost vi:vi-btn-primary vi:vi-btn-square vi:vi-btn-xs"
        @click="zoomIn"
      >
        <ZoomIn :size="16" />
      </button>
      <button
        class="vi:vi-btn vi:vi-btn-ghost vi:vi-btn-primary vi:vi-btn-square vi:vi-btn-xs"
        @click="zoomOut"
      >
        <ZoomOut :size="16" />
      </button>
      <button
        class="vi:vi-btn vi:vi-btn-ghost vi:vi-btn-primary vi:vi-btn-square vi:vi-btn-xs"
        @click="resetZoom"
      >
        <RotateCcw :size="16" />
      </button>
      <button
        class="vi:vi-btn vi:vi-btn-ghost vi:vi-btn-primary vi:vi-btn-square vi:vi-btn-xs"
        @click="openInspector"
        v-if="isDev"
      >
        <SquareMousePointer :size="16" />
      </button>
    </div>
  </div>
</template>
