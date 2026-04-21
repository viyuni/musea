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
  <div class="h-full bg-base-100">
    <div v-if="eventLogs.length > 0" class="divide-y divide-base-content/5">
      <article
        v-for="entry in eventLogs"
        :key="entry.id"
        class="hover:bg-base-content/2 transition-colors"
      >
        <div
          class="flex items-center justify-between px-4 py-1.5 bg-base-content/2 border-b border-base-content/5"
        >
          <div class="flex items-center gap-2">
            <div class="w-1 h-3 bg-secondary rounded-full opacity-60"></div>
            <span class="text-[10px] font-black text-secondary uppercase tracking-tight">{{
              entry.event
            }}</span>
          </div>
          <span class="text-[8px] font-mono text-base-content/40">{{ entry.timestamp }}</span>
        </div>
        <div class="px-4 py-2.5 space-y-1.5">
          <div
            v-for="(payloadItem, index) in entry.payload"
            :key="`${entry.id}-${index}`"
            class="flex items-start gap-3"
          >
            <span
              class="text-[9px] font-bold uppercase tracking-widest text-base-content/30 shrink-0 mt-0.5"
              >{{ payloadItem.type }}</span
            >
            <pre
              class="flex-1 overflow-x-auto text-[10px] font-mono leading-relaxed text-base-content/80"
              >{{ formatDebugValue(payloadItem.value) }}</pre
            >
          </div>
        </div>
      </article>
    </div>
    <div v-else class="h-full flex flex-col items-center justify-center py-20">
      <div
        class="w-12 h-12 rounded-2xl bg-base-200 flex items-center justify-center mb-4 opacity-40"
      >
        <Activity :size="24" class="text-base-content" />
      </div>
      <p class="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/20">
        Listening for component events
      </p>
    </div>
  </div>
</template>
