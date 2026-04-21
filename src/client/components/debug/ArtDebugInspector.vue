<script setup lang="ts">
import { Code2, RefreshCcw, Settings2, Layers } from '@lucide/vue';
import type { ResolvedProp, ResolvedSlot } from '@viyuni/vue-component-meta/types';
import { computed, ref } from 'vue';

import type { SlotDebugState } from '../../types/index.ts';
import ArtDebugSlots from './ArtDebugSlots.vue';
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
  <aside class="w-full flex flex-col">
    <header
      class="flex items-center justify-between border-b border-base-content/5 bg-base-100 px-2 h-10 shrink-0 sticky top-0 z-10"
    >
      <div role="tablist" class="flex gap-4">
        <button
          v-for="tab in ['props', 'slots', 'json'] as const"
          :key="tab"
          role="tab"
          class="relative py-2.5 text-[10px] font-black uppercase tracking-widest transition-all outline-none"
          :class="[
            activeInspectorTab === tab
              ? 'text-primary'
              : 'text-base-content/40 hover:text-base-content/70',
          ]"
          @click="activeInspectorTab = tab"
        >
          <div class="flex items-center gap-1.5 px-2">
            <Settings2 v-if="tab === 'props'" :size="10" />
            <Layers v-else-if="tab === 'slots'" :size="10" />
            <Code2 v-else :size="10" />
            {{ tab }}
          </div>
          <!-- Tab active indicator -->
          <div
            v-if="activeInspectorTab === tab"
            class="absolute -bottom-px left-0 w-full h-0.5 bg-primary rounded-full"
          ></div>
        </button>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto">
      <!-- Props Inspector -->
      <div v-if="activeInspectorTab === 'props'" class="h-full">
        <div
          class="flex items-center justify-between px-4 py-2 border-b border-base-content/5 bg-base-200/5 backdrop-blur-md"
        >
          <span class="text-[10px] font-black uppercase tracking-widest opacity-30"
            >Properties</span
          >
          <button
            class="btn btn-ghost btn-xs h-7 gap-1.5 text-[9px] font-bold uppercase tracking-widest opacity-30 hover:opacity-100"
            @click="resetProps"
          >
            <RefreshCcw :size="10" />
            Reset
          </button>
        </div>
        <SchemaForm v-model:prop-values="propValues" :resolved-props="propDocs" />
      </div>

      <!-- Slots Inspector -->
      <div v-else-if="activeInspectorTab === 'slots'" class="h-full">
        <div
          class="flex items-center justify-between px-4 py-2 border-b border-base-content/5 bg-base-200/5 sticky top-0 z-10 backdrop-blur-md"
        >
          <span class="text-[10px] font-black uppercase tracking-widest opacity-30">Slots</span>
          <button
            class="btn btn-ghost btn-xs h-7 gap-1.5 text-[9px] font-bold uppercase tracking-widest opacity-30 hover:opacity-100"
            @click="resetSlots"
          >
            <RefreshCcw :size="10" />
            Reset
          </button>
        </div>
        <ArtDebugSlots v-model:slot-debug-states="slotDebugStates" :slot-docs="slotDocs" />
      </div>

      <!-- JSON Monitor -->
      <div v-else class="h-full">
        <pre
          class="h-full bg-base-content/2 p-5 text-[11px] font-mono leading-relaxed text-base-content/70"
          >{{ propValuesPreview }}</pre
        >
      </div>
    </main>
  </aside>
</template>
