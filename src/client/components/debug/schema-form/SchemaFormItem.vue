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
      class="ms:ms-input ms:ms-input-bordered ms:ms-input-sm ms:w-full ms:font-mono ms:text-xs ms:focus:ms-input-primary"
      placeholder="Unknown type"
    />
  </div>
</template>
