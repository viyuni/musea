import type { SlotDebugState } from '../types/index.ts';

export interface UpdatePropsMessage {
  type: 'MUSEA_UPDATE_PROPS';
  props: Record<string, unknown>;
}

export interface UpdateSlotsMessage {
  type: 'MUSEA_UPDATE_SLOTS';
  slots: SlotDebugState[];
}

export interface EventPayloadEntry {
  type: string;
  value: unknown;
}

export interface EmitEventMessage {
  type: 'MUSEA_EVENT';
  event: string;
  payload: EventPayloadEntry[];
}

export interface InspectorMessage {
  type: 'MUSEA_INSPECTOR';
}

export type PreviewInboundMessage = UpdatePropsMessage | UpdateSlotsMessage | InspectorMessage;
export type PreviewOutboundMessage = EmitEventMessage;
export type PreviewMessage = PreviewInboundMessage | PreviewOutboundMessage;

export function createUpdatePropsMessage(props: Record<string, unknown>): UpdatePropsMessage {
  return {
    type: 'MUSEA_UPDATE_PROPS',
    props,
  };
}

export function createUpdateSlotsMessage(slots: SlotDebugState[]): UpdateSlotsMessage {
  return {
    type: 'MUSEA_UPDATE_SLOTS',
    slots,
  };
}

export function createEmitEventMessage(event: string, args: unknown[]): EmitEventMessage {
  return {
    type: 'MUSEA_EVENT',
    event,
    payload: args.map((value) => ({
      type: Object.prototype.toString.call(value),
      value: serializeEventValue(value),
    })),
  };
}

export function createInspectorMessage(): InspectorMessage {
  return {
    type: 'MUSEA_INSPECTOR',
  };
}

export function isPreviewMessage(value: unknown): value is PreviewMessage {
  return Boolean(value && typeof value === 'object' && 'type' in value);
}

export function isUpdatePropsMessage(value: unknown): value is UpdatePropsMessage {
  return isPreviewMessage(value) && value.type === 'MUSEA_UPDATE_PROPS';
}

export function isUpdateSlotsMessage(value: unknown): value is UpdateSlotsMessage {
  return isPreviewMessage(value) && value.type === 'MUSEA_UPDATE_SLOTS';
}

export function isEmitEventMessage(value: unknown): value is EmitEventMessage {
  return isPreviewMessage(value) && value.type === 'MUSEA_EVENT' && 'event' in value;
}

export function isInspectorMessage(value: unknown): value is InspectorMessage {
  return isPreviewMessage(value) && value.type === 'MUSEA_INSPECTOR';
}

function serializeEventValue(value: unknown, seen = new WeakSet<object>()): unknown {
  if (
    value == null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (typeof value === 'bigint' || typeof value === 'symbol' || typeof value === 'function') {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Map) {
    return Array.from(value.entries()).map(([key, entryValue]) => [
      serializeEventValue(key, seen),
      serializeEventValue(entryValue, seen),
    ]);
  }

  if (value instanceof Set) {
    return Array.from(value.values()).map((entryValue) => serializeEventValue(entryValue, seen));
  }

  if (Array.isArray(value)) {
    return value.map((entryValue) => serializeEventValue(entryValue, seen));
  }

  if (typeof value === 'object') {
    if (seen.has(value)) {
      return '[Circular]';
    }

    seen.add(value);

    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [
        key,
        serializeEventValue(entryValue, seen),
      ]),
    );
  }

  return String(value);
}
