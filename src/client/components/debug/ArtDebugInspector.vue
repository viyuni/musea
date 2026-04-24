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
  <aside class="ms:w-full ms:flex ms:flex-col">
    <header
      class="ms:flex ms:items-center ms:justify-between ms:border-b ms:border-base-content/5 ms:bg-base-100 ms:px-2 ms:h-10 ms:shrink-0 ms:sticky ms:top-0 ms:z-10"
    >
      <div role="tablist" class="ms:flex ms:gap-4">
        <button
          v-for="tab in ['props', 'slots', 'json'] as const"
          :key="tab"
          role="tab"
          class="ms:relative ms:py-2.5 ms:text-[10px] ms:font-black ms:uppercase ms:tracking-widest ms:transition-all ms:outline-none"
          :class="[
            activeInspectorTab === tab
              ? 'ms:text-primary'
              : 'ms:text-base-content/40 ms:hover:text-base-content/70',
          ]"
          @click="activeInspectorTab = tab"
        >
          <div class="ms:flex ms:items-center ms:gap-1.5 ms:px-2">
            <Settings2 v-if="tab === 'props'" :size="10" />
            <Layers v-else-if="tab === 'slots'" :size="10" />
            <Code2 v-else :size="10" />
            {{ tab }}
          </div>
          <!-- Tab active indicator -->
          <div
            v-if="activeInspectorTab === tab"
            class="ms:absolute ms:-bottom-px ms:left-0 ms:w-full ms:h-0.5 ms:bg-primary ms:rounded-full"
          ></div>
        </button>
      </div>
    </header>

    <main class="ms:flex-1 ms:overflow-y-auto">
      <!-- Props Inspector -->
      <div v-if="activeInspectorTab === 'props'" class="ms:h-full">
        <div
          class="ms:flex ms:items-center ms:justify-between ms:px-4 ms:py-2 ms:border-b ms:border-base-content/5 ms:bg-base-200/5 ms:backdrop-blur-md"
        >
          <span class="ms:text-[10px] ms:font-black ms:uppercase ms:tracking-widest ms:opacity-30"
            >Properties</span
          >
          <button
            class="ms:btn ms:btn-ghost ms:btn-xs ms:h-7 ms:gap-1.5 ms:text-[9px] ms:font-bold ms:uppercase ms:tracking-widest ms:opacity-30 ms:hover:opacity-100"
            @click="resetProps"
          >
            <RefreshCcw :size="10" />
            Reset
          </button>
        </div>
        <SchemaForm v-model:prop-values="propValues" :resolved-props="propDocs" />
      </div>

      <!-- Slots Inspector -->
      <div v-else-if="activeInspectorTab === 'slots'" class="ms:h-full">
        <div
          class="ms:flex ms:items-center ms:justify-between ms:px-4 ms:py-2 ms:border-b ms:border-base-content/5 ms:bg-base-200/5 ms:sticky ms:top-0 ms:z-10 ms:backdrop-blur-md"
        >
          <span class="ms:text-[10px] ms:font-black ms:uppercase ms:tracking-widest ms:opacity-30"
            >Slots</span
          >
          <button
            class="ms:btn ms:btn-ghost ms:btn-xs ms:h-7 ms:gap-1.5 ms:text-[9px] ms:font-bold ms:uppercase ms:tracking-widest ms:opacity-30 ms:hover:opacity-100"
            @click="resetSlots"
          >
            <RefreshCcw :size="10" />
            Reset
          </button>
        </div>
        <ArtDebugSlots v-model:slot-debug-states="slotDebugStates" :slot-docs="slotDocs" />
      </div>

      <!-- JSON Monitor -->
      <div v-else class="ms:h-full">
        <pre
          class="ms:h-full ms:bg-base-content/2 ms:p-5 ms:text-[11px] ms:font-mono ms:leading-relaxed ms:text-base-content/70"
          >{{ propValuesPreview }}</pre
        >
      </div>
    </main>
  </aside>
</template>
