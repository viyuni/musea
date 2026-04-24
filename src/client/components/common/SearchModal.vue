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
  <dialog
    class="ms:ms-modal ms:backdrop:backdrop-blur-sm ms:w-screen"
    role="dialog"
    ref="searchModal"
  >
    <div
      class="ms:ms-modal-box ms:p-0 ms:w-11/12 ms:max-w-2xl ms:border ms:border-base-content/5 ms:bg-base-100 ms:shadow-2xl ms:overflow-hidden ms:rounded-2xl"
    >
      <!-- Search Input Area -->
      <div
        class="ms:flex ms:items-center ms:px-4 ms:py-4 ms:border-b ms:border-base-content/5 ms:bg-base-content/2"
      >
        <Search class="ms:size-4 ms:opacity-30 ms:mr-3 ms:shrink-0" />
        <input
          ref="searchInput"
          v-model="keywords"
          class="ms:bg-transparent ms:border-none ms:outline-none ms:w-full ms:text-sm ms:font-medium ms:placeholder:text-base-content/20"
          placeholder="Search components, categories, or tags..."
          type="text"
          spellcheck="false"
        />
        <div class="ms:flex ms:items-center ms:gap-1 ms:shrink-0 ms:ml-2">
          <kbd class="ms:ms-kbd ms:ms-kbd-xs ms:bg-base-200 ms:border-base-300">ESC</kbd>
        </div>
      </div>

      <!-- Results Area -->
      <div class="ms:max-h-[60vh] ms:overflow-y-auto ms:no-scrollbar ms:py-2">
        <div v-if="filteredArts.length > 0">
          <div
            v-for="(item, index) in filteredArts"
            :key="item.id"
            :data-index="index"
            class="ms:px-2"
          >
            <div
              class="ms:group ms:flex ms:items-center ms:gap-3 ms:px-3 ms:py-3 ms:rounded-xl ms:cursor-pointer ms:transition-all"
              :class="[
                selectedIndex === index
                  ? 'ms:bg-primary ms:text-primary-content ms:shadow-lg ms:shadow-primary/20'
                  : 'ms:hover:bg-base-content/5',
              ]"
              @mouseenter="selectedIndex = index"
              @click="goArt(item.id)"
            >
              <div
                class="ms:size-8 ms:rounded-lg ms:flex ms:items-center ms:justify-center ms:shrink-0"
                :class="[
                  selectedIndex === index ? 'ms:bg-primary-content/20' : 'ms:bg-base-content/5',
                ]"
              >
                <Command
                  :size="16"
                  :class="[selectedIndex === index ? 'ms:text-primary-content' : 'ms:opacity-40']"
                />
              </div>

              <div class="ms:flex-1 ms:min-w-0">
                <div class="ms:flex ms:items-center ms:gap-2">
                  <span
                    class="ms:text-xs ms:font-black ms:uppercase ms:tracking-wider ms:truncate"
                    >{{ item.title }}</span
                  >
                  <span
                    class="ms:text-[9px] ms:font-bold ms:uppercase ms:tracking-widest ms:px-1.5 ms:py-0.5 ms:rounded ms:bg-black/5"
                    :class="[
                      selectedIndex === index
                        ? 'ms:bg-white/10 ms:text-primary-content/80'
                        : 'ms:text-base-content/30',
                    ]"
                  >
                    {{ item.category }}
                  </span>
                </div>
                <p
                  class="ms:text-[10px] ms:mt-0.5 ms:truncate ms:leading-relaxed"
                  :class="[
                    selectedIndex === index ? 'ms:text-primary-content/70' : 'ms:opacity-40',
                  ]"
                >
                  {{ item.description || item.file }}
                </p>
              </div>

              <div class="ms:shrink-0 ms:flex ms:items-center ms:gap-2">
                <CornerDownLeft v-if="selectedIndex === index" :size="12" class="ms:opacity-60" />
                <ArrowRight
                  v-else
                  :size="12"
                  class="ms:opacity-0 ms:group-hover:opacity-20 ms:transition-opacity"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="hasNoResults"
          class="ms:py-12 ms:flex ms:flex-col ms:items-center ms:justify-center ms:gap-3 ms:opacity-20"
        >
          <Search :size="32" stroke-width="1.5" />
          <p class="ms:text-[10px] ms:font-black ms:uppercase ms:tracking-[0.2em]">
            No results for "{{ keywords }}"
          </p>
        </div>
      </div>

      <!-- Footer Hints -->
      <div
        class="ms:px-4 ms:py-2 ms:border-t ms:border-base-content/5 ms:flex ms:items-center ms:gap-4 ms:bg-base-content/1"
      >
        <div class="ms:flex ms:items-center ms:gap-1.5">
          <kbd class="ms:ms-kbd ms:ms-kbd-xs ms:bg-base-200 ms:border-base-300">↵</kbd>
          <span class="ms:text-[9px] ms:font-bold ms:uppercase ms:tracking-widest ms:opacity-30"
            >Select</span
          >
        </div>
        <div class="ms:flex ms:items-center ms:gap-1.5">
          <div class="ms:flex ms:items-center ms:gap-0.5">
            <kbd class="ms:ms-kbd ms:ms-kbd-xs ms:bg-base-200 ms:border-base-300">↑</kbd>
            <kbd class="ms:ms-kbd ms:ms-kbd-xs ms:bg-base-200 ms:border-base-300">↓</kbd>
          </div>
          <span class="ms:text-[9px] ms:font-bold ms:uppercase ms:tracking-widest ms:opacity-30"
            >Navigate</span
          >
        </div>
      </div>
    </div>

    <form method="dialog" class="ms:ms-modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>
