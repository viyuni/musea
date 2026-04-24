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
  <div class="ms:bg-base-100">
    <div v-if="slotDocs.length > 0" class="ms:divide-y ms:divide-base-content/5">
      <article
        v-for="slotDoc in slotDocs"
        :key="slotDoc.name"
        class="ms:p-4 ms:transition-colors ms:hover:bg-base-content/2"
      >
        <div class="ms:flex ms:items-center ms:justify-between ms:mb-3">
          <div class="ms:flex ms:flex-col ms:gap-0.5">
            <span
              class="ms:text-[10px] ms:font-black ms:text-primary ms:uppercase ms:tracking-tight"
              >{{ slotDoc.name || 'default' }}</span
            >
            <p
              v-if="slotDoc.description"
              class="ms:text-[10px] ms:text-base-content/40 ms:leading-relaxed ms:italic"
            >
              {{ slotDoc.description }}
            </p>
          </div>
          <div class="ms:flex ms:items-center ms:gap-3 ms:shrink-0">
            <span
              class="ms:text-[9px] ms:font-bold ms:uppercase ms:tracking-widest ms:text-base-content/20"
              >Active</span
            >
            <input
              :checked="getSlotState(slotDoc.name)?.enabled ?? false"
              type="checkbox"
              class="ms:ms-toggle ms:ms-toggle-primary ms:ms-toggle-xs"
              @change="updateSlotEnabled(slotDoc.name, $event)"
            />
          </div>
        </div>

        <div
          v-if="getSlotState(slotDoc.name)?.enabled"
          class="ms:mt-3 ms:animate-in ms:fade-in ms:slide-in-from-top-1 ms:duration-200"
        >
          <div class="ms:flex ms:flex-col ms:gap-2">
            <label
              class="ms:text-[9px] ms:font-bold ms:uppercase ms:tracking-widest ms:text-base-content/30"
              >Slot Content</label
            >
            <textarea
              :value="getSlotState(slotDoc.name)?.text ?? ''"
              rows="3"
              class="ms:ms-textarea ms:ms-textarea-bordered ms:ms-textarea-sm ms:w-full ms:bg-base-content/2 ms:font-mono ms:text-[11px] ms:leading-relaxed ms:resize-none ms:focus:ms-textarea-primary ms:transition-all"
              placeholder="Enter text or HTML content..."
              @input="updateSlotText(slotDoc.name, $event)"
            ></textarea>
          </div>
        </div>
      </article>
    </div>
    <div v-else class="ms:h-full ms:flex ms:flex-col ms:items-center ms:justify-center ms:py-20">
      <div
        class="ms:w-12 ms:h-12 ms:rounded-2xl ms:bg-base-200 ms:flex ms:items-center ms:justify-center ms:mb-4 ms:opacity-40"
      >
        <Layers :size="24" class="ms:text-base-content" />
      </div>
      <p
        class="ms:text-[10px] ms:font-black ms:uppercase ms:tracking-[0.2em] ms:text-base-content/20"
      >
        No slots defined
      </p>
    </div>
  </div>
</template>
