<script setup lang="ts">
import type { ResolvedObjectSchema } from '@viyuni/vue-component-meta/types';

import SchemaFormItem from './SchemaFormItem.vue';
import { asObject, setObjectField } from './useSchemaFormCollection.ts';

const { schema } = defineProps<{ schema: ResolvedObjectSchema }>();
const modelValue = defineModel<unknown>();

function getFieldValue(key: string) {
  return asObject(modelValue.value)[key];
}

function updateFieldValue(key: string, value: unknown) {
  modelValue.value = setObjectField(modelValue.value, key, value);
}
</script>
<template>
  <div
    class="ms:grid ms:gap-4 ms:relative ms:pl-5 ms:mt-2 ms:before:content-[''] ms:before:block ms:before:absolute ms:before:w-px ms:before:h-[calc(100%-8px)] ms:before:left-1 ms:before:top-1 ms:before:bg-base-content/10"
  >
    <div v-for="(field, key) in schema.value" :key="key" class="ms:grid ms:gap-1.5">
      <div class="ms:flex ms:items-center ms:gap-2">
        <span
          class="ms:text-[10px] ms:font-bold ms:font-mono ms:text-base-content/40 ms:uppercase ms:tracking-wider"
          >{{ key }}</span
        >
      </div>
      <SchemaFormItem
        :schema="field"
        :model-value="getFieldValue(String(key))"
        @update:model-value="(value) => updateFieldValue(String(key), value)"
      />
    </div>
  </div>
</template>
