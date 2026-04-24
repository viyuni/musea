<script setup lang="ts">
import type { ResolvedObjectSchema } from '@viyuni/vue-component-meta/types';

import { asObject, setObjectField } from '../../composables/use-schema-form-collection';
import SchemaFormItem from './SchemaFormItem.vue';

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
    class="vi:grid vi:gap-4 vi:relative vi:pl-5 vi:mt-2 vi:before:content-[''] vi:before:block vi:before:absolute vi:before:w-px vi:before:h-[calc(100%-8px)] vi:before:left-1 vi:before:top-1 vi:before:bg-base-content/10"
  >
    <div v-for="(field, key) in schema.value" :key="key" class="vi:grid vi:gap-1.5">
      <div class="vi:flex vi:items-center vi:gap-2">
        <span
          class="vi:text-[10px] vi:font-bold vi:font-mono vi:text-base-content/40 vi:uppercase vi:tracking-wider"
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
