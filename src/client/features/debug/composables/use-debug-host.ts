import type { ResolvedEvent, ResolvedSlot } from '@viyuni/vue-component-meta/types';
import {
  computed,
  nextTick,
  onScopeDispose,
  ref,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue';

import { ROUTES } from '../../../../shared/constants.ts';
import type { ArtManifest } from '../../../../types/index.ts';
import type { SlotDebugState } from '../../../types/index.ts';
import { resolvePreviewUrl } from '../../../utils/index.ts';
import {
  formatEventPayloadEntries,
  type EventPayloadEntry,
} from '../bridge/debug-preview-shared.ts';
import { useDebugBridge } from './use-debug-bridge.ts';

export interface EventLogEntry {
  id: number;
  event: string;
  timestamp: string;
  declaredType: string;
  payload: EventPayloadEntry[];
}

interface DebugHostOptions {
  art: MaybeRefOrGetter<ArtManifest | null | undefined>;
  eventDocs: MaybeRefOrGetter<ResolvedEvent[]>;
  slotDocs: MaybeRefOrGetter<ResolvedSlot[]>;
}

function getSlotName(name: string) {
  return name || 'default';
}

function createDefaultSlotDebugState(name: string): SlotDebugState {
  return {
    name,
    enabled: false,
    text: name === 'default' ? 'Default slot' : `${name} slot`,
  };
}

function getDeclaredEventType(eventDoc?: ResolvedEvent) {
  if (!eventDoc) {
    return '—';
  }

  return eventDoc.originalType;
}

export function useDebugHost(options: DebugHostOptions) {
  const debugBridge = useDebugBridge();
  const targetWindow = shallowRef<Window | null>(null);
  const propValues = ref<Record<string, unknown>>({});
  const slotDebugStates = ref<Record<string, SlotDebugState>>({});
  const eventLogs = ref<EventLogEntry[]>([]);
  const nextLogId = ref(0);
  const slotDocs = computed(() => toValue(options.slotDocs));
  const eventDocsByName = computed<Record<string, ResolvedEvent>>(() =>
    Object.fromEntries(toValue(options.eventDocs).map((eventDoc) => [eventDoc.name, eventDoc])),
  );
  const slotDebugList = computed(() =>
    slotDocs.value
      .map((slotDoc) => slotDebugStates.value[getSlotName(slotDoc.name)])
      .filter((slot): slot is SlotDebugState => Boolean(slot)),
  );
  const previewUrl = computed(() => {
    const art = toValue(options.art);

    if (!art?.id) {
      return '';
    }

    const url = resolvePreviewUrl(ROUTES.frameComponent);
    url.searchParams.set('artId', art.id);
    return url.toString();
  });
  let teardownHostBridge = () => {};

  const { off: stopListeningPreviewEvents } = debugBridge.onPreviewEvent((payload) => {
    const eventDoc = eventDocsByName.value[payload.event];

    eventLogs.value = [
      {
        id: nextLogId.value++,
        event: payload.event,
        timestamp: new Date().toLocaleTimeString(),
        declaredType: getDeclaredEventType(eventDoc),
        payload: formatEventPayloadEntries(payload.args),
      },
      ...eventLogs.value,
    ].slice(0, 20);
  });

  function postCurrentProps() {
    debugBridge.updateProps(targetWindow.value, propValues.value);
  }

  function postCurrentSlots() {
    debugBridge.updateSlots(targetWindow.value, slotDebugList.value);
  }

  function setTargetWindow(nextTargetWindow: Window | null | undefined) {
    targetWindow.value = nextTargetWindow ?? null;
    teardownHostBridge();
    teardownHostBridge = debugBridge.attachHostBridge(targetWindow.value);
  }

  function toggleInspector() {
    debugBridge.toggleInspector(targetWindow.value);
  }

  function clearEvents() {
    eventLogs.value = [];
  }

  async function postCurrentDebugState() {
    await nextTick();
    postCurrentProps();
    postCurrentSlots();
  }

  watch(
    () => propValues.value,
    () => {
      postCurrentProps();
    },
    { deep: true, immediate: true },
  );

  watch(
    slotDocs,
    (nextSlotDocs) => {
      slotDebugStates.value = Object.fromEntries(
        nextSlotDocs.map((slotDoc) => {
          const name = getSlotName(slotDoc.name);
          return [name, slotDebugStates.value[name] ?? createDefaultSlotDebugState(name)];
        }),
      );
    },
    { immediate: true },
  );

  watch(
    slotDebugList,
    () => {
      postCurrentSlots();
    },
    { deep: true, immediate: true },
  );

  watch(previewUrl, () => {
    void postCurrentDebugState();
  });

  onScopeDispose(() => {
    stopListeningPreviewEvents();
    teardownHostBridge();
  });

  return {
    clearEvents,
    eventLogs,
    postCurrentDebugState,
    previewUrl,
    propValues,
    setTargetWindow,
    slotDebugStates,
    toggleInspector,
  };
}
