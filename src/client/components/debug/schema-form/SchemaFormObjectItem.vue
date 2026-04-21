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
    class="grid gap-4 relative pl-5 mt-2 before:content-[''] before:block before:absolute before:w-px before:h-[calc(100%-8px)] before:left-1 before:top-1 before:bg-base-content/10"
  >
    <div v-for="(field, key) in schema.value" :key="key" class="grid gap-1.5">
      <div class="flex items-center gap-2">
        <span
          class="text-[10px] font-bold font-mono text-base-content/40 uppercase tracking-wider"
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
