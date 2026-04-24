<script setup lang="ts">
import type { ModelRef } from 'vue';

import { useSchemaFormPrimitiveBinding } from '../../composables/use-schema-form-primitive-binding';

const { type } = defineProps<{ type: string; required?: boolean }>();
const modelValue = defineModel<unknown>();

const {
  booleanValue,
  stringValue,
  numberInput,
  jsonInput,
  jsonError,
  updateNumberInput,
  updateJsonInput,
} = useSchemaFormPrimitiveBinding(type, modelValue);
</script>

<template>
  <div class="vi:w-full">
    <div v-if="type === 'boolean'" class="vi:flex vi:items-center">
      <input
        v-model="booleanValue"
        type="checkbox"
        class="vi:vi-toggle vi:vi-toggle-primary vi:vi-toggle-sm"
      />
    </div>
    <textarea
      v-else-if="type === 'string'"
      v-model="stringValue"
      class="vi:vi-textarea vi:vi-textarea-bordered vi:vi-textarea-sm vi:w-full vi:min-h-20 vi:font-mono vi:text-xs vi:focus:vi-textarea-primary vi:leading-tight"
      placeholder="Enter string..."
    ></textarea>
    <input
      v-else-if="type === 'number' || type === 'bigint'"
      :value="numberInput"
      type="number"
      class="vi:vi-input vi:vi-input-bordered vi:vi-input-sm vi:w-full vi:font-mono vi:text-xs vi:focus:vi-input-primary"
      placeholder="0"
      @input="updateNumberInput(($event.target as HTMLInputElement).value)"
    />
    <div v-else class="vi:grid vi:gap-1.5">
      <textarea
        :value="jsonInput"
        class="vi:vi-textarea vi:vi-textarea-bordered vi:vi-textarea-sm vi:w-full vi:min-h-20 vi:font-mono vi:text-xs vi:focus:vi-textarea-primary vi:leading-tight"
        placeholder="JSON data..."
        @input="updateJsonInput(($event.target as HTMLTextAreaElement).value)"
      ></textarea>
      <p v-if="jsonError" class="vi:text-[10px] vi:font-medium vi:text-error">{{ jsonError }}</p>
    </div>
  </div>
</template>
