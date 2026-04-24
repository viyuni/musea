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
  <div class="ms:h-full ms:bg-base-100">
    <div v-if="eventLogs.length > 0" class="ms:divide-y ms:divide-base-content/5">
      <article
        v-for="entry in eventLogs"
        :key="entry.id"
        class="ms:hover:bg-base-content/2 ms:transition-colors"
      >
        <div
          class="ms:flex ms:items-center ms:justify-between ms:px-4 ms:py-1.5 ms:bg-base-content/2 ms:border-b ms:border-base-content/5"
        >
          <div class="ms:flex ms:items-center ms:gap-2">
            <div class="ms:w-1 ms:h-3 ms:bg-secondary ms:rounded-full ms:opacity-60"></div>
            <span
              class="ms:text-[10px] ms:font-black ms:text-secondary ms:uppercase ms:tracking-tight"
              >{{ entry.event }}</span
            >
          </div>
          <span class="ms:text-[8px] ms:font-mono ms:text-base-content/40">{{
            entry.timestamp
          }}</span>
        </div>
        <div class="ms:px-4 ms:py-2.5 ms:space-y-1.5">
          <div
            v-for="(payloadItem, index) in entry.payload"
            :key="`${entry.id}-${index}`"
            class="ms:flex ms:items-start ms:gap-3"
          >
            <span
              class="ms:text-[9px] ms:font-bold ms:uppercase ms:tracking-widest ms:text-base-content/30 ms:shrink-0 ms:mt-0.5"
              >{{ payloadItem.type }}</span
            >
            <pre
              class="ms:flex-1 ms:overflow-x-auto ms:text-[10px] ms:font-mono ms:leading-relaxed ms:text-base-content/80"
              >{{ formatDebugValue(payloadItem.value) }}</pre
            >
          </div>
        </div>
      </article>
    </div>
    <div v-else class="ms:h-full ms:flex ms:flex-col ms:items-center ms:justify-center ms:py-20">
      <div
        class="ms:w-12 ms:h-12 ms:rounded-2xl ms:bg-base-200 ms:flex ms:items-center ms:justify-center ms:mb-4 ms:opacity-40"
      >
        <Activity :size="24" class="ms:text-base-content" />
      </div>
      <p
        class="ms:text-[10px] ms:font-black ms:uppercase ms:tracking-[0.2em] ms:text-base-content/20"
      >
        Listening for component events
      </p>
    </div>
  </div>
</template>
