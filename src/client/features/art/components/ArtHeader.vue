<script setup lang="ts">
import { ROUTES } from '../../../../shared/constants';
import type { ArtManifest } from '../../../../types';
import VSCodeIcon from '../../../shared/components/VSCodeIcon.vue';
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
  <header class="vi:space-y-4">
    <div class="vi:flex vi:items-start vi:justify-between">
      <div>
        <div class="vi:flex vi:items-center vi:gap-3">
          <h1 class="vi:text-3xl vi:font-black vi:tracking-tight">{{ art?.title }}</h1>
          <ArtTag v-if="art" :status="art.status" />
        </div>
      </div>

      <button
        v-if="isDev"
        class="vi:vi-btn vi:vi-btn-sm vi:vi-btn-ghost vi:gap-2 vi:px-3 vi:font-medium vi:text-base-content"
        @click="openInVSCode"
      >
        <VSCodeIcon width="16" height="16" />
        <span class="vi:hidden vi:sm:inline">Open in Editor</span>
      </button>
    </div>
  </header>
</template>
