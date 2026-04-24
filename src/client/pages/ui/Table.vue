<script setup lang="ts" generic="T">
import { computed, h } from 'vue';

const props = defineProps<{
  title?: string;
  list?: T[];
  idKey: keyof T;
}>();

const slots = defineSlots<Record<string, (props: { row: T }) => any>>();
const titles = computed(() => Object.keys(slots));
</script>

<template>
  <div>
    <h2
      v-if="title"
      class="vi:text-xl vi:select-none vi:font-black vi:mb-2 vi:uppercase vi:tracking-tighter"
    >
      {{ title }}
    </h2>

    <div v-if="list && list.length > 0" class="vi:w-full vi:overflow-x-auto">
      <table
        class="vi:vi-table vi:w-max vi:min-w-full vi:vi-rounded-box vi:border vi:border-base-content/5 vi:bg-base-100"
      >
        <thead>
          <tr class="vi:text-base-content vi:text-[11px] vi:uppercase vi:tracking-widest">
            <th v-for="title in titles" :key="title">{{ title }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in list"
            :key="String(item[idKey])"
            class="vi:hover:bg-base-200/30 vi:transition-colors"
          >
            <td v-for="(slot, key) in slots" :key="key">
              <component :is="slot" :row="item" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-else
      class="vi:grid vi:place-items-center vi:p-4 vi:border vi:border-dashed vi:border-base-content/10 vi:vi-rounded-box vi:bg-base-100"
    >
      <div class="vi:text-center">
        <div class="vi:text-base-content/30 vi:font-bold vi:italic vi:tracking-widest vi:uppercase">
          Empty
        </div>
      </div>
    </div>
  </div>
</template>
