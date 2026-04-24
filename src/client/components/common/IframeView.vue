<script setup lang="ts">
import { watchImmediate } from '@vueuse/core';
import { computed, onBeforeUnmount, ref, useTemplateRef, watchEffect } from 'vue';

const props = withDefaults(
  defineProps<{
    url: string;
    fill?: boolean;
    theme?: 'light' | 'dark' | null;
    placeholderHeight?: string;
  }>(),
  {
    fill: false,
    theme: null,
    placeholderHeight: '0px',
  },
);

defineSlots<{
  loading(): any;
}>();

const emit = defineEmits<{
  load: [payload: Event];
  error: [payload: Event];
  'update:loading': [value: boolean];
}>();

const iframe = useTemplateRef('iframe');
const adaptiveHeight = ref<number | null>(null);
const isLoading = ref(true);
let frameResizeObserver: ResizeObserver | null = null;

function toCssHeight(value: number | string | null | undefined) {
  if (value == null) {
    return '0px';
  }

  return typeof value === 'number' ? `${value}px` : value;
}

const iframeStyle = computed(() => {
  if (!props.fill) {
    return {};
  }

  if (isLoading.value) {
    return {
      height: toCssHeight(0),
    };
  }

  if (adaptiveHeight.value == null) {
    return {
      height: toCssHeight(0),
    };
  }

  return {
    height: toCssHeight(adaptiveHeight.value),
  };
});

const iframeClass = computed(() => (props.fill ? 'vi:w-full' : 'vi:size-full'));

function emitLoadingState(value: boolean) {
  isLoading.value = value;
  emit('update:loading', value);
}

function getContentDocument() {
  return iframe.value?.contentDocument;
}

function teardownFrameObserver() {
  frameResizeObserver?.disconnect();
  frameResizeObserver = null;
}

function measureAdaptiveHeight() {
  if (!props.fill) {
    return;
  }

  const doc = getContentDocument();

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

  adaptiveHeight.value = rawHeight;
}

function syncFrameTheme() {
  const doc = getContentDocument();

  if (!doc || !props.theme) {
    return;
  }

  doc.documentElement.style.colorScheme = props.theme;
  doc.documentElement.style.background = 'transparent';

  if (doc.body) {
    doc.body.style.background = 'transparent';
  }
}

function observeAdaptiveHeight() {
  teardownFrameObserver();
  measureAdaptiveHeight();

  if (!props.fill || typeof ResizeObserver === 'undefined') {
    return;
  }

  const doc = getContentDocument();

  if (!doc) return;

  frameResizeObserver = new ResizeObserver(() => {
    measureAdaptiveHeight();
  });

  frameResizeObserver.observe(doc.documentElement);

  if (doc.body) {
    frameResizeObserver.observe(doc.body);
  }
}

function postMessage(message: unknown) {
  iframe.value?.contentWindow?.postMessage(message, '*');
}

function resetFrameState() {
  teardownFrameObserver();
  adaptiveHeight.value = null;
  emitLoadingState(Boolean(props.url));
}

function handleIframeLoad(payload: Event) {
  observeAdaptiveHeight();
  syncFrameTheme();
  emitLoadingState(false);
  emit('load', payload);
}

function handleIframeError(payload: Event) {
  emitLoadingState(false);
  emit('error', payload);
}

watchImmediate(() => props.url, resetFrameState);
watchEffect(measureAdaptiveHeight);
watchEffect(syncFrameTheme);

onBeforeUnmount(teardownFrameObserver);

defineExpose({
  iframe,
  isLoading,
  postMessage,
  getContentDocument,
});
</script>

<template>
  <div
    class="vi:w-full vi:relative vi:overflow-hidden vi:transition-[height]"
    :style="{ height: isLoading ? placeholderHeight : 'unset' }"
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
      <div v-if="isLoading" class="vi:absolute vi:size-full vi:z-10">
        <slot name="loading">
          <div class="vi:w-full vi:h-full vi:bg-base-100"></div>
        </slot>
      </div>
    </Transition>

    <iframe
      :key="props.url"
      ref="iframe"
      :src="props.url"
      frameborder="0"
      loading="lazy"
      class="vi:border-none vi:block vi:select-none"
      :class="iframeClass"
      :style="iframeStyle"
      @load="handleIframeLoad"
      @error="handleIframeError"
    ></iframe>
  </div>
</template>
