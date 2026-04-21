<script setup lang="ts">
import type { ResolvedComponentMeta } from '@viyuni/vue-component-meta/types';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import type { ArtManifest } from '../../../types/index.ts';
import ArtTabDebug from '../debug/ArtTabDebug.vue';
import ArtTabDocs from '../docs/ArtTabDocs.vue';
import ArtHeader from './ArtHeader.vue';
import ArtTabVariants from './ArtTabVariants.vue';

type Tab = 'variants' | 'debug' | 'documents';
const ALL_TABS: Tab[] = ['documents', 'variants', 'debug'];
const TABS: Tab[] = ALL_TABS;
const STORAGE_KEY = 'musea:active-tab';

const { art, docs = [] } = defineProps<{
  art?: ArtManifest | null;
  docs?: ResolvedComponentMeta[] | null;
}>();

const checked = ref<Tab>('documents');
const route = useRoute();
const router = useRouter();

function isTab(value: unknown): value is Tab {
  return typeof value === 'string' && ALL_TABS.includes(value as Tab);
}

function getRouteTab() {
  const tab = route.query.tab;
  return isTab(tab) ? tab : undefined;
}

function readStoredTab() {
  if (typeof localStorage === 'undefined') {
    return undefined;
  }

  const tab = localStorage.getItem(STORAGE_KEY);
  return isTab(tab) ? tab : undefined;
}

function persistTab(tab: Tab) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(STORAGE_KEY, tab);
}

function syncRouteTab(tab: Tab) {
  const id = route.params.id;
  if (route.name !== 'art' || typeof id !== 'string' || getRouteTab() === tab) {
    return;
  }

  router.replace({
    name: 'art',
    params: { id },
    query: { ...route.query, tab },
  });
}

function isChecked(tab: Tab) {
  return checked.value === tab;
}

function toggle(tab: Tab) {
  checked.value = tab;
  persistTab(tab);
  syncRouteTab(tab);
}

watch(
  () => route.query.tab,
  () => {
    const tab = getRouteTab();
    if (isTab(tab)) {
      checked.value = tab;
      persistTab(tab);
      return;
    }

    const storedTab = readStoredTab();
    if (storedTab) {
      checked.value = storedTab;
      syncRouteTab(storedTab);
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="w-full min-h-full flex flex-col">
    <!-- Sticky Top Area: Header + Navigation (Only sticky on desktop) -->
    <div
      class="shrink-0 lg:sticky lg:top-0 z-30 bg-base-100/90 backdrop-blur-md border-b border-base-content/5 px-4 lg:px-8 h-header flex flex-col justify-center"
    >
      <ArtHeader :art="art" class="mb-4" />

      <div class="flex items-center overflow-x-auto scrollbar-hide shrink-0">
        <div class="flex items-center gap-4 sm:gap-8">
          <button
            v-for="tab in TABS"
            :key="tab"
            class="relative pb-1 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer whitespace-nowrap transition-colors"
            :class="[
              isChecked(tab) ? 'text-primary' : 'text-base-content/40 hover:text-base-content/70',
            ]"
            @click="toggle(tab)"
          >
            {{ tab === 'documents' ? 'Docs' : tab }}
            <div
              v-if="isChecked(tab)"
              class="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"
            ></div>
          </button>
        </div>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="flex-1 min-w-0">
      <div v-if="isChecked('variants')" class="px-4 py-4 lg:px-8 lg:py-8">
        <ArtTabVariants :art />
      </div>

      <!-- h-content on Debug means it fits exactly the viewport, so it won't scroll the main page -->
      <div v-if="isChecked('debug')" class="h-content">
        <ArtTabDebug :art :docs />
      </div>

      <div v-if="isChecked('documents')" class="px-4 py-4 lg:px-8 lg:py-8">
        <ArtTabDocs :art :docs />
      </div>
    </div>
  </div>
</template>
