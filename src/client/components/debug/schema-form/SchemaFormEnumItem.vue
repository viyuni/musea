<script setup lang="ts">
import type { ResolvedEnumSchema, ResolvedPrimitiveSchema } from '@viyuni/vue-component-meta/types';
import { computed, ref } from 'vue';

import SchemaFormItem from './SchemaFormItem.vue';

const { schema, required } = defineProps<{ schema: ResolvedEnumSchema; required?: boolean }>();
const modelValue = defineModel<unknown>();
</script>
<template>
  <div class="ms:w-full">
    <select
      v-model="modelValue"
      class="ms:select ms:select-bordered ms:select-sm ms:w-full ms:font-mono ms:text-xs ms:focus:select-primary"
    >
      <option v-if="!schema.required" :value="undefined" class="ms:text-error">undefined</option>
      <option v-if="schema.nullable" :value="null" class="ms:text-error">null</option>
      <option v-for="item in schema.value" :key="String(item)" :value="item">
        {{ String(item) }}
      </option>
    </select>
  </div>
</template>
