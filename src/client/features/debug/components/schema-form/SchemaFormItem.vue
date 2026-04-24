<script setup lang="ts">
import type { ResolvedSchema } from '@viyuni/vue-component-meta/types';

import SchemaFormArrayItem from './SchemaFormArrayItem.vue';
import SchemaFormEnumItem from './SchemaFormEnumItem.vue';
import SchemaFormObjectItem from './SchemaFormObjectItem.vue';
import SchemaFormPrimitiveItem from './SchemaFormPrimitiveItem.vue';

defineProps<{ schema: ResolvedSchema; required?: boolean }>();
const modelValue = defineModel<unknown>();
</script>

<template>
  <SchemaFormEnumItem v-if="schema.kind === 'enum'" v-model="modelValue" :schema :required />
  <SchemaFormArrayItem v-else-if="schema.kind === 'array'" v-model="modelValue" :schema :required />
  <SchemaFormObjectItem
    v-else-if="schema.kind === 'object'"
    v-model="modelValue"
    :schema
    :required
  />
  <SchemaFormPrimitiveItem
    v-else-if="schema.kind === 'primitive'"
    v-model="modelValue"
    :type="schema.type"
    :required
  />
  <div v-else>
    <input
      type="text"
      class="vi:vi-input vi:vi-input-bordered vi:vi-input-sm vi:w-full vi:font-mono vi:text-xs vi:focus:vi-input-primary"
      placeholder="Unknown type"
    />
  </div>
</template>
