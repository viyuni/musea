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
  <div class="ms:w-full ms:min-h-full ms:flex ms:flex-col">
    <!-- Sticky Top Area: Header + Navigation (Only sticky on desktop) -->
    <div
      class="ms:shrink-0 ms:lg:sticky ms:lg:top-0 ms:z-30 ms:bg-base-100/90 ms:backdrop-blur-md ms:border-b ms:border-base-content/5 ms:px-4 ms:lg:px-8 ms:h-header ms:flex ms:flex-col ms:justify-center"
    >
      <ArtHeader :art="art" class="ms:mb-4" />

      <div class="ms:flex ms:items-center ms:overflow-x-auto ms:scrollbar-hide ms:shrink-0">
        <div class="ms:flex ms:items-center ms:gap-4 ms:sm:gap-8">
          <button
            v-for="tab in TABS"
            :key="tab"
            class="ms:relative ms:pb-1 ms:text-[10px] ms:font-black ms:uppercase ms:tracking-widest ms:outline-none ms:cursor-pointer ms:whitespace-nowrap ms:transition-colors"
            :class="[
              isChecked(tab)
                ? 'ms:text-primary'
                : 'ms:text-base-content/40 ms:hover:text-base-content/70',
            ]"
            @click="toggle(tab)"
          >
            {{ tab === 'documents' ? 'Docs' : tab }}
            <div
              v-if="isChecked(tab)"
              class="ms:absolute ms:bottom-0 ms:left-0 ms:w-full ms:h-0.5 ms:bg-primary ms:rounded-full"
            ></div>
          </button>
        </div>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="ms:flex-1 ms:min-w-0">
      <div v-if="isChecked('variants')" class="ms:px-4 ms:py-4 ms:lg:px-8 ms:lg:py-8">
        <ArtTabVariants :art />
      </div>

      <!-- h-content on Debug means it fits exactly the viewport, so it won't scroll the main page -->
      <div v-if="isChecked('debug')" class="ms:h-content">
        <ArtTabDebug :art :docs />
      </div>

      <div v-if="isChecked('documents')" class="ms:px-4 ms:py-4 ms:lg:px-8 ms:lg:py-8">
        <ArtTabDocs :art :docs />
      </div>
    </div>
  </div>
</template>
