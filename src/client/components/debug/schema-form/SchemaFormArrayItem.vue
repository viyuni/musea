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
    class="ms:grid ms:gap-3 ms:w-full ms:relative ms:pl-5 ms:mt-2 ms:before:content-[''] ms:before:block ms:before:absolute ms:before:w-px ms:before:h-[calc(100%-40px)] ms:before:left-1 ms:before:top-1 ms:before:bg-base-content/10"
  >
    <div v-for="(item, index) in items" :key="index" class="ms:group ms:relative">
      <div class="ms:flex ms:items-center ms:justify-between ms:mb-2">
        <span
          class="ms:text-[10px] ms:font-bold ms:font-mono ms:text-base-content/40 ms:uppercase ms:tracking-wider"
          >Item #{{ index }}</span
        >
        <button
          type="button"
          class="ms:btn ms:btn-xs ms:btn-circle ms:btn-error ms:btn-ghost ms:opacity-0 ms:group-hover:opacity-100 ms:transition-opacity"
          title="Remove item"
          @click="remove(index)"
        >
          <Trash2 :size="12" />
        </button>
      </div>
      <div class="ms:w-full">
        <SchemaFormItem
          :schema="schema.value"
          :model-value="item"
          @update:model-value="(value) => updateItem(index, value)"
        />
      </div>
    </div>

    <button
      type="button"
      class="ms:btn ms:btn-sm ms:btn-outline ms:btn-primary ms:w-full ms:gap-1 ms:border-dashed"
      @click="add"
    >
      <Plus :size="14" />
      <span>Add Item</span>
    </button>
  </div>
</template>
