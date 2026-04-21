export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function addArrayItem(value: unknown, item: unknown = undefined): unknown[] {
  return [...asArray(value), item];
}

export function setArrayItem(value: unknown, index: number, item: unknown): unknown[] {
  const next = [...asArray(value)];
  next[index] = item;
  return next;
}

export function removeArrayItem(value: unknown, index: number): unknown[] {
  const next = [...asArray(value)];
  next.splice(index, 1);
  return next;
}

export function asObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

export function setObjectField(
  value: unknown,
  key: string,
  fieldValue: unknown,
): Record<string, unknown> {
  const next = { ...asObject(value) };

  if (fieldValue === undefined) {
    delete next[key];
    return next;
  }

  next[key] = fieldValue;
  return next;
}
