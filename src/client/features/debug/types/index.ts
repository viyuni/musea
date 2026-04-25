import type { SlotDebugState } from '../../../types';

export interface EventPayloadEntry {
  type: string;
  value: unknown;
}

export interface DebugPreviewComponentEvent {
  event: string;
  args: unknown[];
}

export interface DebugPreviewBridge {
  updateProps?(props: Record<string, unknown>): void;
  updateSlots?(slots: SlotDebugState[]): void;
  toggleInspector?(): void;
  emitEvent?(detail: DebugPreviewComponentEvent): void;
}

declare global {
  interface Window {
    __MUSEA_DEBUG__?: DebugPreviewBridge;
  }
}

export function formatEventPayloadEntries(args: unknown[]): EventPayloadEntry[] {
  return args.map((value) => ({
    type: Object.prototype.toString.call(value),
    value,
  }));
}

export function formatDebugValue(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
