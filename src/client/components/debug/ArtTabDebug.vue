<script setup lang="ts">
import { Box, Terminal, Trash2, Settings2, ChevronUp, ChevronDown } from '@lucide/vue';
import type { ResolvedComponentMeta } from '@viyuni/vue-component-meta/types';
import { onClickOutside } from '@vueuse/core';
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue';

import { ROUTES } from '../../../shared/constants.ts';
import type { ArtManifest } from '../../../types/index.ts';
import { createUpdatePropsMessage, createUpdateSlotsMessage } from '../../messages/preview';
import type { SlotDebugState } from '../../types/index.ts';
import { resolvePreviewUrl } from '../../utils/index.ts';
import ArtPreview from '../art/ArtPreview.vue';
import ArtThemeSwitcher from '../art/ArtThemeSwitcher.vue';
import MuseaLogo from '../common/MuseaLogo.vue';
import ArtDebugEvents from './ArtDebugEvents.vue';
import ArtDebugInspector from './ArtDebugInspector.vue';

const props = defineProps<{
  art?: ArtManifest | null;
  docs?: ResolvedComponentMeta[] | null;
}>();

const artPreview = useTemplateRef('artPreview');
const eventsMonitor = useTemplateRef('eventsMonitor');
const eventsPanel = useTemplateRef('eventsPanel');

const propValues = defineModel<Record<string, unknown>>('propValues', { default: () => ({}) });

const isEventsExpanded = ref(false);
const slotDebugStates = ref<Record<string, SlotDebugState>>({});

const primaryDoc = computed(() => props.docs?.[0] ?? null);
const propDocs = computed(() => primaryDoc.value?.props ?? []);
const eventDocs = computed(() => primaryDoc.value?.events ?? []);
const slotDocs = computed(() => primaryDoc.value?.slots ?? []);

const slotDebugList = computed(() =>
  slotDocs.value
    .map((slotDoc) => slotDebugStates.value[getSlotName(slotDoc.name)])
    .filter((slot): slot is SlotDebugState => Boolean(slot)),
);

const previewUrl = computed(() => {
  const art = props.art;
  if (!art?.id) return '';
  return resolveComponentUrl(art.id);
});

function resolveComponentUrl(artId: string) {
  const url = resolvePreviewUrl(ROUTES.frameComponent);
  url.searchParams.set('artId', artId);
  return url.toString();
}

function getSlotName(name: string) {
  return name || 'default';
}

function createDefaultSlotDebugState(name: string): SlotDebugState {
  return {
    name,
    enabled: false,
    text: name === 'default' ? 'Default slot' : `${name} slot`,
  };
}

function postCurrentProps() {
  artPreview.value?.postMessage(createUpdatePropsMessage(propValues.value));
}

function postCurrentSlots() {
  artPreview.value?.postMessage(createUpdateSlotsMessage(slotDebugList.value));
}

async function postCurrentDebugState() {
  await nextTick();
  postCurrentProps();
  postCurrentSlots();
}

watch(() => propValues.value, postCurrentProps, { deep: true, immediate: true });

watch(
  slotDocs,
  (nextSlotDocs) => {
    slotDebugStates.value = Object.fromEntries(
      nextSlotDocs.map((slotDoc) => {
        const name = getSlotName(slotDoc.name);
        return [name, slotDebugStates.value[name] ?? createDefaultSlotDebugState(name)];
      }),
    );
  },
  { immediate: true },
);

watch(slotDebugList, postCurrentSlots, { deep: true, immediate: true });

watch(previewUrl, () => {
  void postCurrentDebugState();
});

onClickOutside(eventsPanel, () => {
  isEventsExpanded.value = false;
});
</script>

<template>
  <div class="vi:flex vi:flex-col vi:h-content vi:w-full vi:overflow-hidden vi:relative">
    <!-- Top Section: Preview & Inspector -->
    <div class="vi:flex-1 vi:flex vi:flex-col vi:lg:flex-row vi:min-h-0">
      <!-- Preview Area -->
      <section class="vi:flex-1 vi:relative vi:flex vi:flex-col vi:min-w-0 vi:overflow-hidden">
        <header
          class="vi:flex vi:items-center vi:justify-between vi:px-4 vi:h-10 vi:border-b vi:border-base-content/5 vi:shrink-0"
        >
          <div class="vi:flex vi:items-center vi:gap-2">
            <span class="vi:text-[10px] vi:font-black vi:uppercase vi:tracking-widest vi:opacity-30"
              >Preview</span
            >
          </div>
          <ArtThemeSwitcher />
        </header>
        <div class="vi:flex-1 vi:relative vi:overflow-hidden vi:lg:pb-10">
          <ArtPreview
            ref="artPreview"
            :url="previewUrl"
            height-mode="auto"
            class="vi:w-full vi:h-full"
          />
        </div>
      </section>

      <!-- Inspector Sidebar -->
      <aside
        class="vi:w-full vi:lg:w-80 vi:xl:w-96 vi:border-t vi:lg:border-t-0 vi:lg:border-l vi:border-base-content/5 vi:flex vi:flex-col vi:flex-1 vi:lg:flex-none vi:lg:shrink-0 vi:overflow-hidden"
      >
        <div class="vi:flex-1 vi:overflow-y-auto vi:overflow-x-hidden vi:pb-10">
          <ArtDebugInspector
            v-model:prop-values="propValues"
            v-model:slot-debug-states="slotDebugStates"
            :prop-docs="propDocs"
            :slot-docs="slotDocs"
          />
        </div>
      </aside>
    </div>

    <!-- Bottom Section: Events Collapsible (Full Width) -->
    <footer
      ref="eventsPanel"
      class="vi:absolute vi:bottom-0 vi:left-0 vi:right-0 vi:z-20 vi:border-t vi:border-base-content/5 vi:flex vi:flex-col vi:transition-all vi:duration-200 vi:ease-in-out vi:bg-base-100 vi:overflow-hidden"
      :class="isEventsExpanded ? 'vi:h-106' : 'vi:h-10'"
    >
      <div
        class="vi:h-10 vi:flex vi:items-center vi:justify-between vi:px-4 vi:bg-base-content/2 vi:cursor-pointer vi:hover:bg-base-content/4 vi:transition-colors vi:shrink-0"
        @click="isEventsExpanded = !isEventsExpanded"
      >
        <div class="vi:flex vi:items-center vi:gap-2">
          <ChevronDown v-if="isEventsExpanded" :size="16" />
          <ChevronUp v-else :size="16" />
          <span class="vi:text-[10px] vi:font-black vi:uppercase vi:tracking-widest">Events</span>
        </div>
        <div class="vi:flex vi:items-center vi:gap-4">
          <button
            v-if="isEventsExpanded"
            class="vi:vi-btn vi:vi-btn-ghost vi:vi-btn-xs vi:h-6 vi:gap-1.5 vi:text-[8px] vi:font-bold vi:uppercase vi:tracking-widest vi:opacity-30 vi:hover:opacity-100 vi:px-2"
            @click.stop="eventsMonitor?.clearLogs()"
          >
            <Trash2 :size="10" />
            Clear
          </button>
        </div>
      </div>

      <div
        class="vi:h-96 vi:border-t vi:border-base-content/5 vi:overflow-y-auto vi:transition-opacity vi:duration-100 vi:delay-100"
        :class="{ 'vi:opacity-0': !isEventsExpanded, 'vi:opacity-100': isEventsExpanded }"
      >
        <ArtDebugEvents ref="eventsMonitor" :event-docs="eventDocs" />
      </div>
    </footer>
  </div>
</template>
