<script setup lang="ts">
import { RotateCcw, ZoomIn, ZoomOut, SquareMousePointer } from '@lucide/vue';
import { computed, ref, useTemplateRef } from 'vue';

import { useSubTheme } from '../../composables/use-theme';
import { createInspectorMessage } from '../../messages/preview';
import IframeView from '../common/IframeView.vue';

const props = defineProps<{
  url: string;
}>();

const emit = defineEmits<{
  load: [];
}>();

const isDev = import.meta.env.DEV;
const zoom = ref(1);
const frame = useTemplateRef<InstanceType<typeof IframeView>>('frame');
const { activeTheme, activeDataTheme } = useSubTheme();

function getFrameDocument() {
  return frame.value?.getContentDocument();
}

function setZoom(value: number) {
  const normalizedZoom = Math.max(0.1, Number(value.toFixed(2)));
  const docEle = getFrameDocument()?.documentElement;

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

function postMessage(message: unknown) {
  frame.value?.postMessage(message);
}

function openInspector() {
  postMessage(createInspectorMessage());
}

function handleFrameLoad() {
  resetZoom();
  emit('load');
}

defineExpose({
  postMessage,
});
</script>

<template>
  <div
    class="vi:size-full vi:overflow-hidden vi:relative vi:group vi:transition-none"
    :data-theme="activeDataTheme"
    :style="{
      backgroundImage: `radial-gradient(
        circle at 1px 1px,
        var(--color-base-300) 1px,
        transparent 0
      )`,
      backgroundSize: '10px 10px',
    }"
  >
    <IframeView
      ref="frame"
      :url="props.url"
      :theme="activeTheme"
      class="vi:size-full"
      placeholder-height="100%"
      @load="handleFrameLoad"
    />

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
        v-if="isDev"
        class="vi:vi-btn vi:vi-btn-ghost vi:vi-btn-primary vi:vi-btn-square vi:vi-btn-xs"
        @click="openInspector"
      >
        <SquareMousePointer :size="16" />
      </button>
    </div>
  </div>
</template>
