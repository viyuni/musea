<script setup lang="ts">
import type { ResolvedProp } from '@viyuni/vue-component-meta/types';
import { toRef } from 'vue';

import { useSchemaFormPropsModel } from '../../composables/use-schema-form-props-model';
import SchemaFormItem from './SchemaFormItem.vue';

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
  <div class="vi:w-full vi:divide-y vi:divide-base-content/5">
    <div
      v-for="prop in props.resolvedProps"
      :key="prop.name"
      class="vi:px-4 vi:py-4 vi:hover:bg-base-content/2 vi:transition-colors"
    >
      <div class="vi:flex vi:flex-col vi:gap-1 vi:mb-3">
        <div class="vi:flex vi:items-center vi:gap-1">
          <span
            class="vi:text-xs vi:font-bold vi:font-mono vi:tracking-tight vi:text-base-content/80"
            >{{ prop.name }}</span
          >
          <span v-if="prop.required" class="vi:text-[10px] vi:text-error vi:font-medium">*</span>
        </div>
        <p
          v-if="prop.description"
          class="vi:text-[11px] vi:leading-relaxed vi:text-base-content/50"
        >
          {{ prop.description }}
        </p>
      </div>
      <div class="vi:w-full">
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
