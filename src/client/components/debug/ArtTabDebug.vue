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
  const url = resolvePreviewUrl(ROUTES.FRAME_COMPONENT);
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
  <div class="flex flex-col h-content w-full overflow-hidden relative">
    <!-- Top Section: Preview & Inspector -->
    <div class="flex-1 flex flex-col lg:flex-row min-h-0">
      <!-- Preview Area -->
      <section class="flex-1 relative flex flex-col min-w-0 overflow-hidden">
        <header
          class="flex items-center justify-between px-4 h-10 border-b border-base-content/5 shrink-0"
        >
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-black uppercase tracking-widest opacity-30">Preview</span>
          </div>
          <ArtThemeSwitcher />
        </header>
        <div class="flex-1 relative overflow-hidden lg:pb-10">
          <ArtPreview ref="artPreview" :url="previewUrl" height-mode="auto" class="w-full h-full" />
        </div>
      </section>

      <!-- Inspector Sidebar -->
      <aside
        class="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-base-content/5 flex flex-col flex-1 lg:flex-none lg:shrink-0 overflow-hidden"
      >
        <div class="flex-1 overflow-y-auto overflow-x-hidden pb-10">
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
      class="absolute bottom-0 left-0 right-0 z-20 border-t border-base-content/5 flex flex-col transition-all duration-200 ease-in-out bg-base-100 overflow-hidden"
      :class="isEventsExpanded ? 'h-106' : 'h-10'"
    >
      <div
        class="h-10 flex items-center justify-between px-4 bg-base-content/2 cursor-pointer hover:bg-base-content/4 transition-colors shrink-0"
        @click="isEventsExpanded = !isEventsExpanded"
      >
        <div class="flex items-center gap-2">
          <ChevronDown v-if="isEventsExpanded" :size="16" />
          <ChevronUp v-else :size="16" />
          <span class="text-[10px] font-black uppercase tracking-widest">Events</span>
        </div>
        <div class="flex items-center gap-4">
          <button
            v-if="isEventsExpanded"
            class="btn btn-ghost btn-xs h-6 gap-1.5 text-[8px] font-bold uppercase tracking-widest opacity-30 hover:opacity-100 px-2"
            @click.stop="eventsMonitor?.clearLogs()"
          >
            <Trash2 :size="10" />
            Clear
          </button>
        </div>
      </div>

      <div
        class="h-96 border-t border-base-content/5 overflow-y-auto transition-opacity duration-100 delay-100"
        :class="{ 'opacity-0': !isEventsExpanded, 'opacity-100': isEventsExpanded }"
      >
        <ArtDebugEvents ref="eventsMonitor" :event-docs="eventDocs" />
      </div>
    </footer>
  </div>
</template>
