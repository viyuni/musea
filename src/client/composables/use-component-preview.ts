import { useEventListener } from '@vueuse/core';
import { type Component, computed, nextTick, onMounted, onUpdated, ref, shallowRef } from 'vue';

import {
  createEmitEventMessage,
  isUpdatePropsMessage,
  isUpdateSlotsMessage,
} from '../messages/preview';
import type { SlotDebugState } from '../types/index.ts';
import { loadComponentPreview } from './use-art-manifest.ts';

interface ComponentPreviewOptions {
  artId: string;
  initialProps: Record<string, unknown>;
}

type PreviewComponentInstance = {
  $?: {
    emit?: ((event: string, ...args: unknown[]) => unknown) | null;
  };
};

function normalizeLoadedComponent(moduleOrComponent: unknown): Component {
  if (
    moduleOrComponent &&
    typeof moduleOrComponent === 'object' &&
    'default' in moduleOrComponent &&
    moduleOrComponent.default
  ) {
    return moduleOrComponent.default as Component;
  }

  return moduleOrComponent as Component;
}

function postEmitEvent(event: string, args: unknown[]) {
  window.parent.postMessage(createEmitEventMessage(event, args), '*');
}

export function useComponentPreview(options: ComponentPreviewOptions) {
  const loadedComponent = shallowRef<Component | null>(null);
  const liveProps = ref<Record<string, unknown>>(options.initialProps);
  const liveSlotStates = ref<SlotDebugState[]>([]);
  const previewRef = ref<PreviewComponentInstance | null>(null);
  let patchedEmit: ((event: string, ...args: unknown[]) => unknown) | null = null;

  const liveSlots = computed(() =>
    Object.fromEntries(
      liveSlotStates.value
        .filter((slot) => slot.enabled)
        .map((slot) => [slot.name || 'default', () => slot.text]),
    ),
  );

  async function loadPreviewComponent() {
    if (!options.artId) {
      throw new Error('missing art id.');
    }

    loadedComponent.value = normalizeLoadedComponent(await loadComponentPreview(options.artId));

    schedulePatch();
  }

  function patchComponentEmit() {
    const internalInstance = previewRef.value?.$;

    if (!internalInstance?.emit || internalInstance.emit === patchedEmit) {
      return;
    }

    const originalEmit = internalInstance.emit.bind(internalInstance);

    patchedEmit = (event: string, ...args: unknown[]) => {
      postEmitEvent(event, args);
      return originalEmit(event, ...args);
    };

    internalInstance.emit = patchedEmit;
  }

  function schedulePatch() {
    void nextTick(() => {
      patchComponentEmit();
    });
  }

  function handleWindowMessage(message: MessageEvent<unknown>) {
    const payload = message.data;

    if (isUpdatePropsMessage(payload)) {
      liveProps.value = payload.props && typeof payload.props === 'object' ? payload.props : {};
      return;
    }

    if (isUpdateSlotsMessage(payload)) {
      liveSlotStates.value = Array.isArray(payload.slots) ? payload.slots : [];
      return;
    }
  }

  useEventListener('message', handleWindowMessage);

  onMounted(() => {
    void loadPreviewComponent();
  });

  onUpdated(schedulePatch);

  return {
    loadedComponent,
    liveProps,
    liveSlots,
    previewRef,
  };
}
