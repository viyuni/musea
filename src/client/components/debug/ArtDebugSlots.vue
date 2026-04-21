<script setup lang="ts">
import { Layers } from '@lucide/vue';
import type { ResolvedSlot } from '@viyuni/vue-component-meta/types';

import type { SlotDebugState } from '../../types/index.ts';

const props = defineProps<{
  slotDocs: ResolvedSlot[];
}>();

const slotDebugStates = defineModel<Record<string, SlotDebugState>>('slotDebugStates', {
  default: () => ({}),
});

function getSlotName(name: string) {
  return name || 'default';
}

function getSlotState(name: string) {
  return slotDebugStates.value[getSlotName(name)];
}

function updateSlotState(name: string, patch: Partial<SlotDebugState>) {
  const key = getSlotName(name);
  const state = slotDebugStates.value[key];

  if (!state) return;

  slotDebugStates.value = {
    ...slotDebugStates.value,
    [key]: {
      ...state,
      ...patch,
    },
  };
}

function updateSlotEnabled(name: string, event: Event) {
  const target = event.target;

  if (!(target instanceof HTMLInputElement)) return;

  updateSlotState(name, { enabled: target.checked });
}

function updateSlotText(name: string, event: Event) {
  const target = event.target;

  if (!(target instanceof HTMLTextAreaElement)) return;

  updateSlotState(name, { text: target.value });
}
</script>

<template>
  <div class="bg-base-100">
    <div v-if="slotDocs.length > 0" class="divide-y divide-base-content/5">
      <article
        v-for="slotDoc in slotDocs"
        :key="slotDoc.name"
        class="p-4 transition-colors hover:bg-base-content/2"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex flex-col gap-0.5">
            <span class="text-[10px] font-black text-primary uppercase tracking-tight">{{
              slotDoc.name || 'default'
            }}</span>
            <p
              v-if="slotDoc.description"
              class="text-[10px] text-base-content/40 leading-relaxed italic"
            >
              {{ slotDoc.description }}
            </p>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <span class="text-[9px] font-bold uppercase tracking-widest text-base-content/20"
              >Active</span
            >
            <input
              :checked="getSlotState(slotDoc.name)?.enabled ?? false"
              type="checkbox"
              class="toggle toggle-primary toggle-xs"
              @change="updateSlotEnabled(slotDoc.name, $event)"
            />
          </div>
        </div>

        <div
          v-if="getSlotState(slotDoc.name)?.enabled"
          class="mt-3 animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <div class="flex flex-col gap-2">
            <label class="text-[9px] font-bold uppercase tracking-widest text-base-content/30"
              >Slot Content</label
            >
            <textarea
              :value="getSlotState(slotDoc.name)?.text ?? ''"
              rows="3"
              class="textarea textarea-bordered textarea-sm w-full bg-base-content/2 font-mono text-[11px] leading-relaxed resize-none focus:textarea-primary transition-all"
              placeholder="Enter text or HTML content..."
              @input="updateSlotText(slotDoc.name, $event)"
            ></textarea>
          </div>
        </div>
      </article>
    </div>
    <div v-else class="h-full flex flex-col items-center justify-center py-20">
      <div
        class="w-12 h-12 rounded-2xl bg-base-200 flex items-center justify-center mb-4 opacity-40"
      >
        <Layers :size="24" class="text-base-content" />
      </div>
      <p class="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/20">
        No slots defined
      </p>
    </div>
  </div>
</template>
