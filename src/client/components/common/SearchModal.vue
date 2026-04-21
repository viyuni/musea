<script setup lang="ts">
import { Search, Command, ArrowRight, CornerDownLeft } from '@lucide/vue';
import { onKeyStroke, refDebounced } from '@vueuse/core';
import { ref, computed, watch, nextTick } from 'vue';
import { useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';

import { useArtManifest } from '../../composables/use-art-manifest';

const router = useRouter();
const searchModal = useTemplateRef('searchModal');
const searchInput = useTemplateRef('searchInput');
const { arts } = useArtManifest();
const keywords = ref('');
const debouncedKeywords = refDebounced(keywords, 100);
const selectedIndex = ref(0);

const indexedArts = computed(() => {
  return arts.value.map((item) => ({
    ...item,
    searchKey:
      `${item.title} ${item.description ?? ''} ${item.tags.join(' ')} ${item.category} ${item.file}`.toLowerCase(),
  }));
});

const filteredArts = computed(() => {
  const query = debouncedKeywords.value.trim().toLowerCase();
  if (!query) return arts.value.slice(0, 10); // Show recent or first 10 when empty

  return indexedArts.value.filter((item) => item.searchKey.includes(query));
});

const hasNoResults = computed(
  () => filteredArts.value.length === 0 && keywords.value.trim() !== '',
);

function open() {
  searchModal.value?.showModal();
  keywords.value = '';
  selectedIndex.value = 0;
  nextTick(() => {
    searchInput.value?.focus();
  });
}

function close() {
  searchModal.value?.close();
}

function goArt(artId: string) {
  router.push({ name: 'art', params: { id: artId } });
  close();
}

// Keyboard Navigation
function navigateDown() {
  if (filteredArts.value.length === 0) return;
  selectedIndex.value = (selectedIndex.value + 1) % filteredArts.value.length;
  scrollToSelected();
}

function navigateUp() {
  if (filteredArts.value.length === 0) return;
  selectedIndex.value =
    (selectedIndex.value - 1 + filteredArts.value.length) % filteredArts.value.length;
  scrollToSelected();
}

function selectCurrent() {
  const item = filteredArts.value[selectedIndex.value];
  if (item) goArt(item.id);
}

function scrollToSelected() {
  nextTick(() => {
    const el = document.querySelector(`[data-index="${selectedIndex.value}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  });
}

onKeyStroke(['k', 'K'], (e) => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    open();
  }
});

onKeyStroke(['ArrowDown'], (e) => {
  if (searchModal.value?.open) {
    e.preventDefault();
    navigateDown();
  }
});

onKeyStroke(['ArrowUp'], (e) => {
  if (searchModal.value?.open) {
    e.preventDefault();
    navigateUp();
  }
});

onKeyStroke(['Tab'], (e) => {
  if (searchModal.value?.open) {
    e.preventDefault();
    if (e.shiftKey) navigateUp();
    else navigateDown();
  }
});

onKeyStroke(['Enter'], (e) => {
  if (searchModal.value?.open) {
    e.preventDefault();
    selectCurrent();
  }
});

watch(debouncedKeywords, () => {
  selectedIndex.value = 0;
});

defineExpose({ open, close });
</script>

<template>
  <dialog class="modal backdrop:backdrop-blur-sm w-screen" role="dialog" ref="searchModal">
    <div
      class="modal-box p-0 w-11/12 max-w-2xl border border-base-content/5 bg-base-100 shadow-2xl overflow-hidden rounded-2xl"
    >
      <!-- Search Input Area -->
      <div class="flex items-center px-4 py-4 border-b border-base-content/5 bg-base-content/2">
        <Search class="size-4 opacity-30 mr-3 shrink-0" />
        <input
          ref="searchInput"
          v-model="keywords"
          class="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-base-content/20"
          placeholder="Search components, categories, or tags..."
          type="text"
          spellcheck="false"
        />
        <div class="flex items-center gap-1 shrink-0 ml-2">
          <kbd class="kbd kbd-xs bg-base-200 border-base-300">ESC</kbd>
        </div>
      </div>

      <!-- Results Area -->
      <div class="max-h-[60vh] overflow-y-auto no-scrollbar py-2">
        <div v-if="filteredArts.length > 0">
          <div
            v-for="(item, index) in filteredArts"
            :key="item.id"
            :data-index="index"
            class="px-2"
          >
            <div
              class="group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all"
              :class="[
                selectedIndex === index
                  ? 'bg-primary text-primary-content shadow-lg shadow-primary/20'
                  : 'hover:bg-base-content/5',
              ]"
              @mouseenter="selectedIndex = index"
              @click="goArt(item.id)"
            >
              <div
                class="size-8 rounded-lg flex items-center justify-center shrink-0"
                :class="[selectedIndex === index ? 'bg-primary-content/20' : 'bg-base-content/5']"
              >
                <Command
                  :size="16"
                  :class="[selectedIndex === index ? 'text-primary-content' : 'opacity-40']"
                />
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-black uppercase tracking-wider truncate">{{
                    item.title
                  }}</span>
                  <span
                    class="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-black/5"
                    :class="[
                      selectedIndex === index
                        ? 'bg-white/10 text-primary-content/80'
                        : 'text-base-content/30',
                    ]"
                  >
                    {{ item.category }}
                  </span>
                </div>
                <p
                  class="text-[10px] mt-0.5 truncate leading-relaxed"
                  :class="[selectedIndex === index ? 'text-primary-content/70' : 'opacity-40']"
                >
                  {{ item.description || item.file }}
                </p>
              </div>

              <div class="shrink-0 flex items-center gap-2">
                <CornerDownLeft v-if="selectedIndex === index" :size="12" class="opacity-60" />
                <ArrowRight
                  v-else
                  :size="12"
                  class="opacity-0 group-hover:opacity-20 transition-opacity"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="hasNoResults"
          class="py-12 flex flex-col items-center justify-center gap-3 opacity-20"
        >
          <Search :size="32" stroke-width="1.5" />
          <p class="text-[10px] font-black uppercase tracking-[0.2em]">
            No results for "{{ keywords }}"
          </p>
        </div>
      </div>

      <!-- Footer Hints -->
      <div
        class="px-4 py-2 border-t border-base-content/5 flex items-center gap-4 bg-base-content/1"
      >
        <div class="flex items-center gap-1.5">
          <kbd class="kbd kbd-xs bg-base-200 border-base-300">↵</kbd>
          <span class="text-[9px] font-bold uppercase tracking-widest opacity-30">Select</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="flex items-center gap-0.5">
            <kbd class="kbd kbd-xs bg-base-200 border-base-300">↑</kbd>
            <kbd class="kbd kbd-xs bg-base-200 border-base-300">↓</kbd>
          </div>
          <span class="text-[9px] font-bold uppercase tracking-widest opacity-30">Navigate</span>
        </div>
      </div>
    </div>

    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>
