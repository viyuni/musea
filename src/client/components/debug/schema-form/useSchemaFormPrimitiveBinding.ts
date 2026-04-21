import { computed, ref, watch, type Ref } from 'vue';

function formatJsonValue(value: unknown): string {
  if (value == null) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'bigint') {
    return value.toString();
  }

  try {
    return JSON.stringify(value, null, 2) ?? '';
  } catch {
    return String(value);
  }
}

export function useSchemaFormPrimitiveBinding(type: string, modelValue: Ref<unknown>) {
  const jsonInput = ref('');
  const jsonError = ref('');
  const numberInput = ref('');

  const booleanValue = computed<boolean>({
    get() {
      return Boolean(modelValue.value);
    },
    set(value) {
      modelValue.value = value;
    },
  });

  const stringValue = computed<string>({
    get() {
      return typeof modelValue.value === 'string' ? modelValue.value : '';
    },
    set(value) {
      modelValue.value = value;
    },
  });

  watch(
    modelValue,
    (nextValue) => {
      if (jsonError.value) {
        return;
      }

      jsonInput.value = formatJsonValue(nextValue);
    },
    { immediate: true },
  );

  watch(
    modelValue,
    (nextValue) => {
      if (typeof nextValue === 'number' || typeof nextValue === 'bigint') {
        numberInput.value = String(nextValue);
        return;
      }

      numberInput.value = '';
    },
    { immediate: true },
  );

  function updateJsonInput(nextValue: string) {
    jsonInput.value = nextValue;
    const trimmed = nextValue.trim();

    if (!trimmed) {
      jsonError.value = '';
      modelValue.value = undefined;
      return;
    }

    try {
      modelValue.value = JSON.parse(nextValue);
      jsonError.value = '';
    } catch {
      jsonError.value = 'Invalid JSON';
    }
  }

  function updateNumberInput(nextValue: string) {
    numberInput.value = nextValue;
    const trimmed = nextValue.trim();

    if (!trimmed) {
      modelValue.value = undefined;
      return;
    }

    if (type === 'bigint') {
      try {
        modelValue.value = BigInt(trimmed);
      } catch {
        // Keep last valid modelValue while user is typing.
      }
      return;
    }

    const parsed = Number(trimmed);

    if (!Number.isNaN(parsed)) {
      modelValue.value = parsed;
    }
  }

  return {
    booleanValue,
    stringValue,
    numberInput,
    jsonInput,
    jsonError,
    updateNumberInput,
    updateJsonInput,
  };
}
