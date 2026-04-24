<script setup lang="ts">
import { Layers } from '@lucide/vue';
import type { ResolvedSlot } from '@viyuni/vue-component-meta/types';

import type { SlotDebugState } from '../../../types/index.ts';

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
  <div class="vi:bg-base-100">
    <div v-if="slotDocs.length > 0" class="vi:divide-y vi:divide-base-content/5">
      <article
        v-for="slotDoc in slotDocs"
        :key="slotDoc.name"
        class="vi:p-4 vi:transition-colors vi:hover:bg-base-content/2"
      >
        <div class="vi:flex vi:items-center vi:justify-between vi:mb-3">
          <div class="vi:flex vi:flex-col vi:gap-0.5">
            <span
              class="vi:text-[10px] vi:font-black vi:text-primary vi:uppercase vi:tracking-tight"
              >{{ slotDoc.name || 'default' }}</span
            >
            <p
              v-if="slotDoc.description"
              class="vi:text-[10px] vi:text-base-content/40 vi:leading-relaxed vi:italic"
            >
              {{ slotDoc.description }}
            </p>
          </div>
          <div class="vi:flex vi:items-center vi:gap-3 vi:shrink-0">
            <span
              class="vi:text-[9px] vi:font-bold vi:uppercase vi:tracking-widest vi:text-base-content/20"
              >Active</span
            >
            <input
              :checked="getSlotState(slotDoc.name)?.enabled ?? false"
              type="checkbox"
              class="vi:vi-toggle vi:vi-toggle-primary vi:vi-toggle-xs"
              @change="updateSlotEnabled(slotDoc.name, $event)"
            />
          </div>
        </div>

        <div
          v-if="getSlotState(slotDoc.name)?.enabled"
          class="vi:mt-3 vi:animate-in vi:fade-in vi:slide-in-from-top-1 vi:duration-200"
        >
          <div class="vi:flex vi:flex-col vi:gap-2">
            <label
              class="vi:text-[9px] vi:font-bold vi:uppercase vi:tracking-widest vi:text-base-content/30"
              >Slot Content</label
            >
            <textarea
              :value="getSlotState(slotDoc.name)?.text ?? ''"
              rows="3"
              class="vi:vi-textarea vi:vi-textarea-bordered vi:vi-textarea-sm vi:w-full vi:bg-base-content/2 vi:font-mono vi:text-[11px] vi:leading-relaxed vi:resize-none vi:focus:vi-textarea-primary vi:transition-all"
              placeholder="Enter text or HTML content..."
              @input="updateSlotText(slotDoc.name, $event)"
            ></textarea>
          </div>
        </div>
      </article>
    </div>
    <div v-else class="vi:h-full vi:flex vi:flex-col vi:items-center vi:justify-center vi:py-20">
      <div
        class="vi:w-12 vi:h-12 vi:rounded-2xl vi:bg-base-200 vi:flex vi:items-center vi:justify-center vi:mb-4 vi:opacity-40"
      >
        <Layers :size="24" class="vi:text-base-content" />
      </div>
      <p
        class="vi:text-[10px] vi:font-black vi:uppercase vi:tracking-[0.2em] vi:text-base-content/20"
      >
        No slots defined
      </p>
    </div>
  </div>
</template>
