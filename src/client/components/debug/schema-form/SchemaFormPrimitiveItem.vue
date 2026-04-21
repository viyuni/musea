<script setup lang="ts">
import { useSchemaFormPrimitiveBinding } from './useSchemaFormPrimitiveBinding.ts';

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
  <div class="w-full">
    <div v-if="type === 'boolean'" class="flex items-center">
      <input v-model="booleanValue" type="checkbox" class="toggle toggle-primary toggle-sm" />
    </div>
    <textarea
      v-else-if="type === 'string'"
      v-model="stringValue"
      class="textarea textarea-bordered textarea-sm w-full min-h-20 font-mono text-xs focus:textarea-primary leading-tight"
      placeholder="Enter string..."
    ></textarea>
    <input
      v-else-if="type === 'number' || type === 'bigint'"
      :value="numberInput"
      type="number"
      class="input input-bordered input-sm w-full font-mono text-xs focus:input-primary"
      placeholder="0"
      @input="updateNumberInput(($event.target as HTMLInputElement).value)"
    />
    <div v-else class="grid gap-1.5">
      <textarea
        :value="jsonInput"
        class="textarea textarea-bordered textarea-sm w-full min-h-20 font-mono text-xs focus:textarea-primary leading-tight"
        placeholder="JSON data..."
        @input="updateJsonInput(($event.target as HTMLTextAreaElement).value)"
      ></textarea>
      <p v-if="jsonError" class="text-[10px] font-medium text-error">{{ jsonError }}</p>
    </div>
  </div>
</template>
