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
  <div class="ms:w-full">
    <div v-if="type === 'boolean'" class="ms:flex ms:items-center">
      <input
        v-model="booleanValue"
        type="checkbox"
        class="ms:toggle ms:toggle-primary ms:toggle-sm"
      />
    </div>
    <textarea
      v-else-if="type === 'string'"
      v-model="stringValue"
      class="ms:textarea ms:textarea-bordered ms:textarea-sm ms:w-full ms:min-h-20 ms:font-mono ms:text-xs ms:focus:textarea-primary ms:leading-tight"
      placeholder="Enter string..."
    ></textarea>
    <input
      v-else-if="type === 'number' || type === 'bigint'"
      :value="numberInput"
      type="number"
      class="ms:input ms:input-bordered ms:input-sm ms:w-full ms:font-mono ms:text-xs ms:focus:input-primary"
      placeholder="0"
      @input="updateNumberInput(($event.target as HTMLInputElement).value)"
    />
    <div v-else class="ms:grid ms:gap-1.5">
      <textarea
        :value="jsonInput"
        class="ms:textarea ms:textarea-bordered ms:textarea-sm ms:w-full ms:min-h-20 ms:font-mono ms:text-xs ms:focus:textarea-primary ms:leading-tight"
        placeholder="JSON data..."
        @input="updateJsonInput(($event.target as HTMLTextAreaElement).value)"
      ></textarea>
      <p v-if="jsonError" class="ms:text-[10px] ms:font-medium ms:text-error">{{ jsonError }}</p>
    </div>
  </div>
</template>
