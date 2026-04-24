<script setup lang="ts">
import type { ResolvedEnumSchema } from '@viyuni/vue-component-meta/types';

const { schema } = defineProps<{ schema: ResolvedEnumSchema; required?: boolean }>();
const modelValue = defineModel<unknown>();
</script>
<template>
  <div class="vi:w-full">
    <select
      v-model="modelValue"
      class="vi:vi-select vi:vi-select-bordered vi:vi-select-sm vi:w-full vi:font-mono vi:text-xs vi:focus:vi-select-primary"
    >
      <option v-if="!schema.required" :value="undefined" class="vi:text-error">undefined</option>
      <option v-if="schema.nullable" :value="null" class="vi:text-error">null</option>
      <option v-for="item in schema.value" :key="String(item)" :value="item">
        {{ String(item) }}
      </option>
    </select>
  </div>
</template>
