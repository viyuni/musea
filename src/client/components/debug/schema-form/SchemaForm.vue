<script setup lang="ts">
import type { ResolvedProp } from '@viyuni/vue-component-meta/types';
import { toRef } from 'vue';

import SchemaFormItem from './SchemaFormItem.vue';
import { useSchemaFormPropsModel } from './useSchemaFormPropsModel.ts';

const props = withDefaults(
  defineProps<{
    resolvedProps?: ResolvedProp[];
  }>(),
  {
    resolvedProps: () => [],
  },
);

const propValues = defineModel<Record<string, unknown>>('propValues', {
  default: () => ({}),
});

const { getPropValue, setPropValue } = useSchemaFormPropsModel(
  toRef(props, 'resolvedProps'),
  propValues,
);
</script>

<template>
  <div class="ms:w-full ms:divide-y ms:divide-base-content/5">
    <div
      v-for="prop in props.resolvedProps"
      :key="prop.name"
      class="ms:px-4 ms:py-4 ms:hover:bg-base-content/2 ms:transition-colors"
    >
      <div class="ms:flex ms:flex-col ms:gap-1 ms:mb-3">
        <div class="ms:flex ms:items-center ms:gap-1">
          <span
            class="ms:text-xs ms:font-bold ms:font-mono ms:tracking-tight ms:text-base-content/80"
            >{{ prop.name }}</span
          >
          <span v-if="prop.required" class="ms:text-[10px] ms:text-error ms:font-medium">*</span>
        </div>
        <p
          v-if="prop.description"
          class="ms:text-[11px] ms:leading-relaxed ms:text-base-content/50"
        >
          {{ prop.description }}
        </p>
      </div>
      <div class="ms:w-full">
        <SchemaFormItem
          :schema="prop.resolved"
          :required="prop.required"
          :model-value="getPropValue(prop.name)"
          @update:model-value="(value) => setPropValue(prop.name, value)"
        />
      </div>
    </div>
  </div>
</template>
