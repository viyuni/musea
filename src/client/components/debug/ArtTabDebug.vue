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
  <div class="ms:flex ms:flex-col ms:h-content ms:w-full ms:overflow-hidden ms:relative">
    <!-- Top Section: Preview & Inspector -->
    <div class="ms:flex-1 ms:flex ms:flex-col ms:lg:flex-row ms:min-h-0">
      <!-- Preview Area -->
      <section class="ms:flex-1 ms:relative ms:flex ms:flex-col ms:min-w-0 ms:overflow-hidden">
        <header
          class="ms:flex ms:items-center ms:justify-between ms:px-4 ms:h-10 ms:border-b ms:border-base-content/5 ms:shrink-0"
        >
          <div class="ms:flex ms:items-center ms:gap-2">
            <span class="ms:text-[10px] ms:font-black ms:uppercase ms:tracking-widest ms:opacity-30"
              >Preview</span
            >
          </div>
          <ArtThemeSwitcher />
        </header>
        <div class="ms:flex-1 ms:relative ms:overflow-hidden ms:lg:pb-10">
          <ArtPreview
            ref="artPreview"
            :url="previewUrl"
            height-mode="auto"
            class="ms:w-full ms:h-full"
          />
        </div>
      </section>

      <!-- Inspector Sidebar -->
      <aside
        class="ms:w-full ms:lg:w-80 ms:xl:w-96 ms:border-t ms:lg:border-t-0 ms:lg:border-l ms:border-base-content/5 ms:flex ms:flex-col ms:flex-1 ms:lg:flex-none ms:lg:shrink-0 ms:overflow-hidden"
      >
        <div class="ms:flex-1 ms:overflow-y-auto ms:overflow-x-hidden ms:pb-10">
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
      class="ms:absolute ms:bottom-0 ms:left-0 ms:right-0 ms:z-20 ms:border-t ms:border-base-content/5 ms:flex ms:flex-col ms:transition-all ms:duration-200 ms:ease-in-out ms:bg-base-100 ms:overflow-hidden"
      :class="isEventsExpanded ? 'ms:h-106' : 'ms:h-10'"
    >
      <div
        class="ms:h-10 ms:flex ms:items-center ms:justify-between ms:px-4 ms:bg-base-content/2 ms:cursor-pointer ms:hover:bg-base-content/4 ms:transition-colors ms:shrink-0"
        @click="isEventsExpanded = !isEventsExpanded"
      >
        <div class="ms:flex ms:items-center ms:gap-2">
          <ChevronDown v-if="isEventsExpanded" :size="16" />
          <ChevronUp v-else :size="16" />
          <span class="ms:text-[10px] ms:font-black ms:uppercase ms:tracking-widest">Events</span>
        </div>
        <div class="ms:flex ms:items-center ms:gap-4">
          <button
            v-if="isEventsExpanded"
            class="ms:btn ms:btn-ghost ms:btn-xs ms:h-6 ms:gap-1.5 ms:text-[8px] ms:font-bold ms:uppercase ms:tracking-widest ms:opacity-30 ms:hover:opacity-100 ms:px-2"
            @click.stop="eventsMonitor?.clearLogs()"
          >
            <Trash2 :size="10" />
            Clear
          </button>
        </div>
      </div>

      <div
        class="ms:h-96 ms:border-t ms:border-base-content/5 ms:overflow-y-auto ms:transition-opacity ms:duration-100 ms:delay-100"
        :class="{ 'ms:opacity-0': !isEventsExpanded, 'ms:opacity-100': isEventsExpanded }"
      >
        <ArtDebugEvents ref="eventsMonitor" :event-docs="eventDocs" />
      </div>
    </footer>
  </div>
</template>
