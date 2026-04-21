<script setup lang="ts">
import { ROUTES } from '../../../shared/constants.ts';
import type { ArtManifest } from '../../../types/index.ts';
import VSCodeIcon from '../common/VSCodeIcon.vue';
import ArtTag from './ArtTag.vue';

const props = defineProps<{
  art?: ArtManifest | null;
}>();

const isDev = import.meta.env.DEV;

function openInVSCode() {
  const file = props.art?.file;
  if (!file) return;

  const url = new URL(ROUTES.OPEN_IN_EDITOR, window.location.origin);
  url.searchParams.set('file', file);
  fetch(url);
}
</script>

<template>
  <header class="space-y-4">
    <div class="flex items-start justify-between">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-black tracking-tight">{{ art?.title }}</h1>
          <ArtTag v-if="art" :status="art.status" />
        </div>
      </div>

      <button
        v-if="isDev"
        class="btn btn-sm btn-ghost gap-2 px-3 font-medium text-base-content"
        @click="openInVSCode"
      >
        <VSCodeIcon width="16" height="16" />
        <span class="hidden sm:inline">Open in Editor</span>
      </button>
    </div>
  </header>
</template>
