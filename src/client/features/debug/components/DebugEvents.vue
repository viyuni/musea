<script setup lang="ts">
import { Activity } from '@lucide/vue';

import { formatDebugValue } from '../bridge/debug-preview-shared.ts';
import type { EventLogEntry } from '../composables/use-debug-host.ts';

defineProps<{
  eventLogs: EventLogEntry[];
}>();
</script>

<template>
  <div class="vi:h-full vi:bg-base-100">
    <div v-if="eventLogs.length > 0" class="vi:divide-y vi:divide-base-content/5">
      <article
        v-for="entry in eventLogs"
        :key="entry.id"
        class="vi:hover:bg-base-content/2 vi:transition-colors"
      >
        <div
          class="vi:flex vi:items-center vi:justify-between vi:px-4 vi:py-1.5 vi:bg-base-content/2 vi:border-b vi:border-base-content/5"
        >
          <div class="vi:flex vi:items-center vi:gap-2">
            <div class="vi:w-1 vi:h-3 vi:bg-secondary vi:rounded-full vi:opacity-60"></div>
            <span
              class="vi:text-[10px] vi:font-black vi:text-secondary vi:uppercase vi:tracking-tight"
              >{{ entry.event }}</span
            >
          </div>
          <span class="vi:text-[8px] vi:font-mono vi:text-base-content/40">{{
            entry.timestamp
          }}</span>
        </div>
        <div class="vi:px-4 vi:py-2.5 vi:space-y-1.5">
          <div
            v-for="(payloadItem, index) in entry.payload"
            :key="`${entry.id}-${index}`"
            class="vi:flex vi:items-start vi:gap-3"
          >
            <span
              class="vi:text-[9px] vi:font-bold vi:uppercase vi:tracking-widest vi:text-base-content/30 vi:shrink-0 vi:mt-0.5"
              >{{ payloadItem.type }}</span
            >
            <pre
              class="vi:flex-1 vi:overflow-x-auto vi:text-[10px] vi:font-mono vi:leading-relaxed vi:text-base-content/80"
              >{{ formatDebugValue(payloadItem.value) }}</pre
            >
          </div>
        </div>
      </article>
    </div>
    <div v-else class="vi:h-full vi:flex vi:flex-col vi:items-center vi:justify-center vi:py-20">
      <div
        class="vi:w-12 vi:h-12 vi:rounded-2xl vi:bg-base-200 vi:flex vi:items-center vi:justify-center vi:mb-4 vi:opacity-40"
      >
        <Activity :size="24" class="vi:text-base-content" />
      </div>
      <p
        class="vi:text-[10px] vi:font-black vi:uppercase vi:tracking-[0.2em] vi:text-base-content/20"
      >
        Listening for component events
      </p>
    </div>
  </div>
</template>
