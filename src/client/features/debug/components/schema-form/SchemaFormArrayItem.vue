<script setup lang="ts">
import { Plus, Trash2 } from '@lucide/vue';
import type { ResolvedArraySchema } from '@viyuni/vue-component-meta/types';
import { computed } from 'vue';

import {
  addArrayItem,
  asArray,
  removeArrayItem,
  setArrayItem,
} from '../../composables/use-schema-form-collection';
import SchemaFormItem from './SchemaFormItem.vue';

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
    class="vi:grid vi:gap-3 vi:w-full vi:relative vi:pl-5 vi:mt-2 vi:before:content-[''] vi:before:block vi:before:absolute vi:before:w-px vi:before:h-[calc(100%-40px)] vi:before:left-1 vi:before:top-1 vi:before:bg-base-content/10"
  >
    <div v-for="(item, index) in items" :key="index" class="vi:group vi:relative">
      <div class="vi:flex vi:items-center vi:justify-between vi:mb-2">
        <span
          class="vi:text-[10px] vi:font-bold vi:font-mono vi:text-base-content/40 vi:uppercase vi:tracking-wider"
          >Item #{{ index }}</span
        >
        <button
          type="button"
          class="vi:vi-btn vi:vi-btn-xs vi:vi-btn-circle vi:vi-btn-error vi:vi-btn-ghost vi:opacity-0 vi:group-hover:opacity-100 vi:transition-opacity"
          title="Remove item"
          @click="remove(index)"
        >
          <Trash2 :size="12" />
        </button>
      </div>
      <div class="vi:w-full">
        <SchemaFormItem
          :schema="schema.value"
          :model-value="item"
          @update:model-value="(value) => updateItem(index, value)"
        />
      </div>
    </div>

    <button
      type="button"
      class="vi:vi-btn vi:vi-btn-sm vi:vi-btn-outline vi:vi-btn-primary vi:w-full vi:gap-1 vi:border-dashed"
      @click="add"
    >
      <Plus :size="14" />
      <span>Add Item</span>
    </button>
  </div>
</template>
