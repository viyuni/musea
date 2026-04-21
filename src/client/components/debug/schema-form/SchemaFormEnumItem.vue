<script setup lang="ts">
import type { ResolvedEnumSchema, ResolvedPrimitiveSchema } from '@viyuni/vue-component-meta/types';
import { computed, ref } from 'vue';

import SchemaFormItem from './SchemaFormItem.vue';

const { schema, required } = defineProps<{ schema: ResolvedEnumSchema; required?: boolean }>();
const modelValue = defineModel<unknown>();
</script>
<template>
  <div class="w-full">
    <select
      v-model="modelValue"
      class="select select-bordered select-sm w-full font-mono text-xs focus:select-primary"
    >
      <option v-if="!schema.required" :value="undefined" class="text-error">undefined</option>
      <option v-if="schema.nullable" :value="null" class="text-error">null</option>
      <option v-for="item in schema.value" :key="String(item)" :value="item">
        {{ String(item) }}
      </option>
    </select>
  </div>
</template>
