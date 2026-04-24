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

  const url = new URL(ROUTES.openInEditor, window.location.origin);
  url.searchParams.set('file', file);
  fetch(url);
}
</script>

<template>
  <header class="ms:space-y-4">
    <div class="ms:flex ms:items-start ms:justify-between">
      <div>
        <div class="ms:flex ms:items-center ms:gap-3">
          <h1 class="ms:text-3xl ms:font-black ms:tracking-tight">{{ art?.title }}</h1>
          <ArtTag v-if="art" :status="art.status" />
        </div>
      </div>

      <button
        v-if="isDev"
        class="ms:btn ms:btn-sm ms:btn-ghost ms:gap-2 ms:px-3 ms:font-medium ms:text-base-content"
        @click="openInVSCode"
      >
        <VSCodeIcon width="16" height="16" />
        <span class="ms:hidden ms:sm:inline">Open in Editor</span>
      </button>
    </div>
  </header>
</template>
