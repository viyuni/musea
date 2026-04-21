<script setup lang="ts">
import { defineAsyncComponent, markRaw, shallowRef, watchEffect, type Component } from 'vue';

import type { ArtManifest } from '../../../types/index.ts';
import { loadArtMarkdownDoc } from '../../composables/use-art-doc.ts';

const props = defineProps<{
  art: ArtManifest;
}>();

const MarkdownDocs = defineAsyncComponent(async () => {
  const res = await loadArtMarkdownDoc(props.art.id);

  if (!res) {
    return Promise.reject(new Error('Failed to load markdown doc.'));
  }

  return res;
});
</script>

<template>
  <MarkdownDocs />
</template>
