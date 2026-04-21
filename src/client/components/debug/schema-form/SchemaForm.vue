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
  <div class="w-full divide-y divide-base-content/5">
    <div
      v-for="prop in props.resolvedProps"
      :key="prop.name"
      class="px-4 py-4 hover:bg-base-content/2 transition-colors"
    >
      <div class="flex flex-col gap-1 mb-3">
        <div class="flex items-center gap-1">
          <span class="text-xs font-bold font-mono tracking-tight text-base-content/80">{{
            prop.name
          }}</span>
          <span v-if="prop.required" class="text-[10px] text-error font-medium">*</span>
        </div>
        <p v-if="prop.description" class="text-[11px] leading-relaxed text-base-content/50">
          {{ prop.description }}
        </p>
      </div>
      <div class="w-full">
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
