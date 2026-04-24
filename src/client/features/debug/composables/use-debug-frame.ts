import {
  computed,
  nextTick,
  onMounted,
  onScopeDispose,
  onUpdated,
  ref,
  shallowRef,
  type Component,
} from 'vue';

import type { SlotDebugState } from '../../../types/index.ts';
import { loadArtComponent } from '../../art/composables/use-art-manifest.ts';
import { useDebugBridge } from './use-debug-bridge.ts';

interface DebugFrameOptions {
  artId: string;
  initialProps: Record<string, unknown>;
}

type PreviewComponentInstance = {
  $?: {
    emit?: ((event: string, ...args: unknown[]) => unknown) | null;
  };
};

declare global {
  interface Window {
    __VUE_INSPECTOR__?: {
      disable(): void;
      openInEditor(url: string): void;
      toggleEnabled(): void;
    };
  }
}

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

export function useDebugFrame(options: DebugFrameOptions) {
  const debugBridge = useDebugBridge();
  const loadedComponent = shallowRef<Component | null>(null);
  const liveProps = ref<Record<string, unknown>>(options.initialProps);
  const liveSlotStates = ref<SlotDebugState[]>([]);
  const previewRef = ref<PreviewComponentInstance | null>(null);
  const inspector = window.__VUE_INSPECTOR__;
  let patchedEmit: ((event: string, ...args: unknown[]) => unknown) | null = null;

  const { off: stopListeningProps } = debugBridge.onPropsUpdated((props) => {
    liveProps.value = props;
  });
  const { off: stopListeningSlots } = debugBridge.onSlotsUpdated(({ slots }) => {
    liveSlotStates.value = slots;
  });
  const detachFrameBridge = debugBridge.attachFrameBridge();

  if (inspector) {
    inspector.openInEditor = (url) => {
      inspector.disable();
      void fetch(url);
    };
  }

  const { off: stopListeningInspector } = debugBridge.onInspectorToggled(() => {
    inspector?.toggleEnabled();
  });

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

    loadedComponent.value = normalizeLoadedComponent(await loadArtComponent(options.artId));
    schedulePatch();
  }

  function patchComponentEmit() {
    const internalInstance = previewRef.value?.$;

    if (!internalInstance?.emit || internalInstance.emit === patchedEmit) {
      return;
    }

    const originalEmit = internalInstance.emit.bind(internalInstance);

    patchedEmit = (event: string, ...args: unknown[]) => {
      debugBridge.emitPreviewEvent({ event, args });
      return originalEmit(event, ...args);
    };

    internalInstance.emit = patchedEmit;
  }

  function schedulePatch() {
    void nextTick(() => {
      patchComponentEmit();
    });
  }

  onMounted(() => {
    void loadPreviewComponent();
  });

  onUpdated(schedulePatch);
  onScopeDispose(() => {
    stopListeningProps();
    stopListeningSlots();
    stopListeningInspector();
    detachFrameBridge();
  });

  return {
    loadedComponent,
    liveProps,
    liveSlots,
    previewRef,
  };
}
