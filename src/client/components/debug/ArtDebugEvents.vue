<script setup lang="ts">
import { Activity } from '@lucide/vue';
import type { ResolvedEvent } from '@viyuni/vue-component-meta/types';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import { isEmitEventMessage, type EventPayloadEntry } from '../../messages/preview';

interface EventLogEntry {
  id: number;
  event: string;
  timestamp: string;
  declaredType: string;
  payload: EventPayloadEntry[];
}

const props = defineProps<{
  eventDocs: ResolvedEvent[];
}>();

const eventLogs = ref<EventLogEntry[]>([]);
const nextLogId = ref(0);

const eventDocsByName = computed<Record<string, ResolvedEvent>>(() =>
  Object.fromEntries(props.eventDocs.map((eventDoc) => [eventDoc.name, eventDoc])),
);

function getDeclaredEventType(eventDoc?: ResolvedEvent) {
  if (!eventDoc) return '—';

  return eventDoc.originalType;
}

function clearLogs() {
  eventLogs.value = [];
}

function formatDebugValue(value: unknown) {
  if (typeof value === 'string') return value;

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function handleWindowMessage(message: MessageEvent<unknown>) {
  const payload = message.data;

  if (!isEmitEventMessage(payload)) {
    return;
  }

  const eventDoc = eventDocsByName.value[payload.event];

  eventLogs.value = [
    {
      id: nextLogId.value++,
      event: payload.event,
      timestamp: new Date().toLocaleTimeString(),
      declaredType: getDeclaredEventType(eventDoc),
      payload: Array.isArray(payload.payload) ? payload.payload : [],
    },
    ...eventLogs.value,
  ].slice(0, 20);
}

onMounted(() => {
  window.addEventListener('message', handleWindowMessage);
});

onBeforeUnmount(() => {
  window.removeEventListener('message', handleWindowMessage);
});

defineExpose({
  clearLogs,
});
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
