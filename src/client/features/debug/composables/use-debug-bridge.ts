import { createEventHook, createSharedComposable } from '@vueuse/core';

import type { SlotDebugState } from '../../../types/index.ts';
import type { DebugPreviewBridge, DebugPreviewComponentEvent } from '../types/index.ts';

const noop = () => {};
type DebugSlotsPayload = { slots: SlotDebugState[] };

function normalizeProps(props: Record<string, unknown> | null | undefined) {
  return props && typeof props === 'object' && !Array.isArray(props) ? props : {};
}

function normalizeSlots(slots: SlotDebugState[] | null | undefined) {
  return Array.isArray(slots) ? slots : [];
}

function getDebugPreviewBridge(targetWindow: Window | null | undefined) {
  try {
    return targetWindow?.__MUSEA_DEBUG__;
  } catch {
    return undefined;
  }
}

export const useDebugBridge = createSharedComposable(() => {
  const propsUpdated = createEventHook<Record<string, unknown>>();
  const slotsUpdated = createEventHook<DebugSlotsPayload>();
  const inspectorToggled = createEventHook<void>();
  const previewEvent = createEventHook<DebugPreviewComponentEvent>();

  function updateProps(targetWindow: Window | null | undefined, props: Record<string, unknown>) {
    getDebugPreviewBridge(targetWindow)?.updateProps?.(props);
  }

  function updateSlots(targetWindow: Window | null | undefined, slots: SlotDebugState[]) {
    getDebugPreviewBridge(targetWindow)?.updateSlots?.(slots);
  }

  function toggleInspector(targetWindow: Window | null | undefined) {
    getDebugPreviewBridge(targetWindow)?.toggleInspector?.();
  }

  function emitPreviewEvent(detail: DebugPreviewComponentEvent) {
    try {
      window.__MUSEA_DEBUG__?.emitEvent?.(detail);
    } catch {}
  }

  function attachFrameBridge() {
    const previousBridge = window.__MUSEA_DEBUG__;
    const frameBridge: DebugPreviewBridge = {
      ...previousBridge,
      updateProps(props) {
        propsUpdated.trigger(normalizeProps(props));
      },
      updateSlots(slots) {
        slotsUpdated.trigger({ slots: normalizeSlots(slots) });
      },
      toggleInspector() {
        inspectorToggled.trigger();
      },
    };

    window.__MUSEA_DEBUG__ = frameBridge;

    return () => {
      if (window.__MUSEA_DEBUG__ === frameBridge) {
        window.__MUSEA_DEBUG__ = previousBridge;
      }
    };
  }

  function attachHostBridge(targetWindow: Window | null | undefined) {
    if (!targetWindow) {
      return noop;
    }

    try {
      const previousBridge = targetWindow.__MUSEA_DEBUG__;
      const emitEvent = (detail: DebugPreviewComponentEvent) => {
        previewEvent.trigger(detail);
      };

      targetWindow.__MUSEA_DEBUG__ = {
        ...previousBridge,
        emitEvent,
      };

      return () => {
        if (targetWindow.__MUSEA_DEBUG__?.emitEvent === emitEvent) {
          targetWindow.__MUSEA_DEBUG__ = previousBridge;
        }
      };
    } catch {
      return noop;
    }
  }

  return {
    attachFrameBridge,
    attachHostBridge,
    emitPreviewEvent,
    onInspectorToggled: inspectorToggled.on,
    onPreviewEvent: previewEvent.on,
    onPropsUpdated: propsUpdated.on,
    onSlotsUpdated: slotsUpdated.on,
    toggleInspector,
    updateProps,
    updateSlots,
  };
});
