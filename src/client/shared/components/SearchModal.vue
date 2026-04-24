<script setup lang="ts">
import { Search, Command, ArrowRight, CornerDownLeft } from '@lucide/vue';
import { onKeyStroke, refDebounced } from '@vueuse/core';
import { ref, computed, watch, nextTick } from 'vue';
import { useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';

import { useArtManifest } from '../../features/art/composables/use-art-manifest';

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
    class="vi:vi-modal vi:backdrop:backdrop-blur-sm vi:w-screen"
    role="dialog"
    ref="searchModal"
  >
    <div
      class="vi:vi-modal-box vi:p-0 vi:w-11/12 vi:max-w-2xl vi:border vi:border-base-content/5 vi:bg-base-100 vi:shadow-2xl vi:overflow-hidden vi:rounded-2xl"
    >
      <!-- Search Input Area -->
      <div
        class="vi:flex vi:items-center vi:px-4 vi:py-4 vi:border-b vi:border-base-content/5 vi:bg-base-content/2"
      >
        <Search class="vi:size-4 vi:opacity-30 vi:mr-3 vi:shrink-0" />
        <input
          ref="searchInput"
          v-model="keywords"
          class="vi:bg-transparent vi:border-none vi:outline-none vi:w-full vi:text-sm vi:font-medium vi:placeholder:text-base-content/20"
          placeholder="Search components, categories, or tags..."
          type="text"
          spellcheck="false"
        />
        <div class="vi:flex vi:items-center vi:gap-1 vi:shrink-0 vi:ml-2">
          <kbd class="vi:vi-kbd vi:vi-kbd-xs vi:bg-base-200 vi:border-base-300">ESC</kbd>
        </div>
      </div>

      <!-- Results Area -->
      <div class="vi:max-h-[60vh] vi:overflow-y-auto vi:no-scrollbar vi:py-2">
        <div v-if="filteredArts.length > 0">
          <div
            v-for="(item, index) in filteredArts"
            :key="item.id"
            :data-index="index"
            class="vi:px-2"
          >
            <div
              class="vi:group vi:flex vi:items-center vi:gap-3 vi:px-3 vi:py-3 vi:rounded-xl vi:cursor-pointer vi:transition-all"
              :class="[
                selectedIndex === index
                  ? 'vi:bg-primary vi:text-primary-content vi:shadow-lg vi:shadow-primary/20'
                  : 'vi:hover:bg-base-content/5',
              ]"
              @mouseenter="selectedIndex = index"
              @click="goArt(item.id)"
            >
              <div
                class="vi:size-8 vi:rounded-lg vi:flex vi:items-center vi:justify-center vi:shrink-0"
                :class="[
                  selectedIndex === index ? 'vi:bg-primary-content/20' : 'vi:bg-base-content/5',
                ]"
              >
                <Command
                  :size="16"
                  :class="[selectedIndex === index ? 'vi:text-primary-content' : 'vi:opacity-40']"
                />
              </div>

              <div class="vi:flex-1 vi:min-w-0">
                <div class="vi:flex vi:items-center vi:gap-2">
                  <span
                    class="vi:text-xs vi:font-black vi:uppercase vi:tracking-wider vi:truncate"
                    >{{ item.title }}</span
                  >
                  <span
                    class="vi:text-[9px] vi:font-bold vi:uppercase vi:tracking-widest vi:px-1.5 vi:py-0.5 vi:rounded vi:bg-black/5"
                    :class="[
                      selectedIndex === index
                        ? 'vi:bg-white/10 vi:text-primary-content/80'
                        : 'vi:text-base-content/30',
                    ]"
                  >
                    {{ item.category }}
                  </span>
                </div>
                <p
                  class="vi:text-[10px] vi:mt-0.5 vi:truncate vi:leading-relaxed"
                  :class="[
                    selectedIndex === index ? 'vi:text-primary-content/70' : 'vi:opacity-40',
                  ]"
                >
                  {{ item.description || item.file }}
                </p>
              </div>

              <div class="vi:shrink-0 vi:flex vi:items-center vi:gap-2">
                <CornerDownLeft v-if="selectedIndex === index" :size="12" class="vi:opacity-60" />
                <ArrowRight
                  v-else
                  :size="12"
                  class="vi:opacity-0 vi:group-hover:opacity-20 vi:transition-opacity"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="hasNoResults"
          class="vi:py-12 vi:flex vi:flex-col vi:items-center vi:justify-center vi:gap-3 vi:opacity-20"
        >
          <Search :size="32" stroke-width="1.5" />
          <p class="vi:text-[10px] vi:font-black vi:uppercase vi:tracking-[0.2em]">
            No results for "{{ keywords }}"
          </p>
        </div>
      </div>

      <!-- Footer Hints -->
      <div
        class="vi:px-4 vi:py-2 vi:border-t vi:border-base-content/5 vi:flex vi:items-center vi:gap-4 vi:bg-base-content/1"
      >
        <div class="vi:flex vi:items-center vi:gap-1.5">
          <kbd class="vi:vi-kbd vi:vi-kbd-xs vi:bg-base-200 vi:border-base-300">↵</kbd>
          <span class="vi:text-[9px] vi:font-bold vi:uppercase vi:tracking-widest vi:opacity-30"
            >Select</span
          >
        </div>
        <div class="vi:flex vi:items-center vi:gap-1.5">
          <div class="vi:flex vi:items-center vi:gap-0.5">
            <kbd class="vi:vi-kbd vi:vi-kbd-xs vi:bg-base-200 vi:border-base-300">↑</kbd>
            <kbd class="vi:vi-kbd vi:vi-kbd-xs vi:bg-base-200 vi:border-base-300">↓</kbd>
          </div>
          <span class="vi:text-[9px] vi:font-bold vi:uppercase vi:tracking-widest vi:opacity-30"
            >Navigate</span
          >
        </div>
      </div>
    </div>

    <form method="dialog" class="vi:vi-modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>
