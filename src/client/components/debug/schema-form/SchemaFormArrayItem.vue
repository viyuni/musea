<script setup lang="ts">
import { Plus, Trash2 } from '@lucide/vue';
import type { ResolvedArraySchema } from '@viyuni/vue-component-meta/types';
import { computed } from 'vue';

import SchemaFormItem from './SchemaFormItem.vue';
import { addArrayItem, asArray, removeArrayItem, setArrayItem } from './useSchemaFormCollection.ts';

const { schema } = defineProps<{ schema: ResolvedArraySchema }>();
const modelValue = defineModel<unknown>();
const items = computed(() => asArray(modelValue.value));

function add() {
  modelValue.value = addArrayItem(modelValue.value);
}

function remove(index: number) {
  modelValue.value = removeArrayItem(modelValue.value, index);
}

function updateItem(index: number, value: unknown) {
  modelValue.value = setArrayItem(modelValue.value, index, value);
}
</script>

<template>
  <div
    class="grid gap-3 w-full relative pl-5 mt-2 before:content-[''] before:block before:absolute before:w-px before:h-[calc(100%-40px)] before:left-1 before:top-1 before:bg-base-content/10"
  >
    <div v-for="(item, index) in items" :key="index" class="group relative">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[10px] font-bold font-mono text-base-content/40 uppercase tracking-wider"
          >Item #{{ index }}</span
        >
        <button
          type="button"
          class="btn btn-xs btn-circle btn-error btn-ghost opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove item"
          @click="remove(index)"
        >
          <Trash2 :size="12" />
        </button>
      </div>
      <div class="w-full">
        <SchemaFormItem
          :schema="schema.value"
          :model-value="item"
          @update:model-value="(value) => updateItem(index, value)"
        />
      </div>
    </div>

    <button
      type="button"
      class="btn btn-sm btn-outline btn-primary w-full gap-1 border-dashed"
      @click="add"
    >
      <Plus :size="14" />
      <span>Add Item</span>
    </button>
  </div>
</template>
