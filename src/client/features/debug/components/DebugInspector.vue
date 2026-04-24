<script setup lang="ts">
import { Code2, RefreshCcw, Settings2, Layers } from '@lucide/vue';
import type { ResolvedProp, ResolvedSlot } from '@viyuni/vue-component-meta/types';
import { computed, ref } from 'vue';

import type { SlotDebugState } from '../../../types/index.ts';
import ArtDebugSlots from './DebugSlots.vue';
import SchemaForm from './schema-form/SchemaForm.vue';

const { propDocs, slotDocs } = defineProps<{
  propDocs: ResolvedProp[];
  slotDocs: ResolvedSlot[];
}>();

const propValues = defineModel<Record<string, unknown>>('propValues', { default: () => ({}) });
const slotDebugStates = defineModel<Record<string, SlotDebugState>>('slotDebugStates', {
  default: () => ({}),
});

const activeInspectorTab = ref<'props' | 'slots' | 'json'>('props');

const propValuesPreview = computed(() => {
  try {
    return JSON.stringify(propValues.value, null, 2);
  } catch {
    return '{}';
  }
});

function resetProps() {
  propValues.value = {};
}

function resetSlots() {
  slotDebugStates.value = {};
}
</script>

<template>
  <aside class="vi:w-full vi:flex vi:flex-col">
    <header
      class="vi:flex vi:items-center vi:justify-between vi:border-b vi:border-base-content/5 vi:bg-base-100 vi:px-2 vi:h-10 vi:shrink-0 vi:sticky vi:top-0 vi:z-10"
    >
      <div role="tablist" class="vi:flex vi:gap-4">
        <button
          v-for="tab in ['props', 'slots', 'json'] as const"
          :key="tab"
          role="tab"
          class="vi:relative vi:py-2.5 vi:text-[10px] vi:font-black vi:uppercase vi:tracking-widest vi:transition-all vi:outline-none"
          :class="[
            activeInspectorTab === tab
              ? 'vi:text-primary'
              : 'vi:text-base-content/40 vi:hover:text-base-content/70',
          ]"
          @click="activeInspectorTab = tab"
        >
          <div class="vi:flex vi:items-center vi:gap-1.5 vi:px-2">
            <Settings2 v-if="tab === 'props'" :size="10" />
            <Layers v-else-if="tab === 'slots'" :size="10" />
            <Code2 v-else :size="10" />
            {{ tab }}
          </div>
          <!-- Tab active indicator -->
          <div
            v-if="activeInspectorTab === tab"
            class="vi:absolute vi:-bottom-px vi:left-0 vi:w-full vi:h-0.5 vi:bg-primary vi:rounded-full"
          ></div>
        </button>
      </div>
    </header>

    <main class="vi:flex-1 vi:overflow-y-auto">
      <!-- Props Inspector -->
      <div v-if="activeInspectorTab === 'props'" class="vi:h-full">
        <div
          class="vi:flex vi:items-center vi:justify-between vi:px-4 vi:py-2 vi:border-b vi:border-base-content/5 vi:bg-base-200/5 vi:backdrop-blur-md"
        >
          <span class="vi:text-[10px] vi:font-black vi:uppercase vi:tracking-widest vi:opacity-30"
            >Properties</span
          >
          <button
            class="vi:vi-btn vi:vi-btn-ghost vi:vi-btn-xs vi:h-7 vi:gap-1.5 vi:text-[9px] vi:font-bold vi:uppercase vi:tracking-widest vi:opacity-30 vi:hover:opacity-100"
            @click="resetProps"
          >
            <RefreshCcw :size="10" />
            Reset
          </button>
        </div>
        <SchemaForm v-model:prop-values="propValues" :resolved-props="propDocs" />
      </div>

      <!-- Slots Inspector -->
      <div v-else-if="activeInspectorTab === 'slots'" class="vi:h-full">
        <div
          class="vi:flex vi:items-center vi:justify-between vi:px-4 vi:py-2 vi:border-b vi:border-base-content/5 vi:bg-base-200/5 vi:sticky vi:top-0 vi:z-10 vi:backdrop-blur-md"
        >
          <span class="vi:text-[10px] vi:font-black vi:uppercase vi:tracking-widest vi:opacity-30"
            >Slots</span
          >
          <button
            class="vi:vi-btn vi:vi-btn-ghost vi:vi-btn-xs vi:h-7 vi:gap-1.5 vi:text-[9px] vi:font-bold vi:uppercase vi:tracking-widest vi:opacity-30 vi:hover:opacity-100"
            @click="resetSlots"
          >
            <RefreshCcw :size="10" />
            Reset
          </button>
        </div>
        <ArtDebugSlots v-model:slot-debug-states="slotDebugStates" :slot-docs="slotDocs" />
      </div>

      <!-- JSON Monitor -->
      <div v-else class="vi:h-full">
        <pre
          class="vi:h-full vi:bg-base-content/2 vi:p-5 vi:text-[11px] vi:font-mono vi:leading-relaxed vi:text-base-content/70"
          >{{ propValuesPreview }}</pre
        >
      </div>
    </main>
  </aside>
</template>
