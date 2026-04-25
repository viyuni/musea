<script setup lang="ts">
import type { ResolvedComponentMeta } from '@viyuni/vue-component-meta/types';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import type { ArtManifest } from '../../../../types';
import { DebugTab } from '../../debug/index.ts';
import { DocsTab } from '../../docs/index.ts';
import ArtHeader from './ArtHeader.vue';

type Tab = 'debug' | 'documents';

const TABS: Tab[] = ['documents', 'debug'];
const STORAGE_KEY = 'musea:active-tab';

const { art, docs = [] } = defineProps<{
  art?: ArtManifest | null;
  docs?: ResolvedComponentMeta[] | null;
}>();

const checked = ref<Tab>('documents');
const route = useRoute();
const router = useRouter();

function isTab(value: unknown): value is Tab {
  return typeof value === 'string' && TABS.includes(value as Tab);
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
  <div class="vi:w-full vi:min-h-full vi:flex vi:flex-col">
    <!-- Sticky Top Area: Header + Navigation (Only sticky on desktop) -->
    <div
      class="vi:shrink-0 vi:lg:sticky vi:lg:top-0 vi:z-30 vi:bg-base-100/90 vi:backdrop-blur-md vi:border-b vi:border-base-content/5 vi:px-4 vi:lg:px-8 vi:h-header vi:flex vi:flex-col vi:justify-center"
    >
      <ArtHeader :art="art" class="vi:mb-4" />

      <div class="vi:flex vi:items-center vi:overflow-x-auto vi:scrollbar-hide vi:shrink-0">
        <div class="vi:flex vi:items-center vi:gap-4 vi:sm:gap-8">
          <button
            v-for="tab in TABS"
            :key="tab"
            class="vi:relative vi:pb-1 vi:text-[10px] vi:font-black vi:uppercase vi:tracking-widest vi:outline-none vi:cursor-pointer vi:whitespace-nowrap vi:transition-colors"
            :class="[
              isChecked(tab)
                ? 'vi:text-primary'
                : 'vi:text-base-content/40 vi:hover:text-base-content/70',
            ]"
            @click="toggle(tab)"
          >
            {{ tab === 'documents' ? 'Docs' : tab }}
            <div
              v-if="isChecked(tab)"
              class="vi:absolute vi:bottom-0 vi:left-0 vi:w-full vi:h-0.5 vi:bg-primary vi:rounded-full"
            ></div>
          </button>
        </div>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="vi:flex-1 vi:min-w-0">
      <!-- h-content on Debug means it fits exactly the viewport, so it won't scroll the main page -->
      <div v-if="isChecked('debug')" class="vi:h-content">
        <DebugTab :art :docs />
      </div>

      <div v-if="isChecked('documents')" class="vi:px-4 vi:py-4 vi:lg:px-8 vi:lg:py-8">
        <DocsTab :art :docs />
      </div>
    </div>
  </div>
</template>
