<script setup lang="ts" generic="T">
import { computed } from 'vue';

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
    <h2 v-if="title" class="text-xl select-none font-black mb-2 uppercase tracking-tighter">
      {{ title }}
    </h2>

    <div v-if="list && list.length > 0" class="w-full overflow-x-auto">
      <table class="table min-w-100 w-full rounded-box border border-base-content/5 bg-base-100">
        <thead>
          <tr class="text-base-content text-[11px] uppercase tracking-widest">
            <th v-for="title in titles" :key="title">{{ title }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in list"
            :key="String(item[idKey])"
            class="hover:bg-base-200/50 transition-colors"
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
      class="grid place-items-center p-4 border border-dashed border-base-content/10 rounded-box bg-base-100"
    >
      <div class="text-center">
        <div class="text-base-content/30 font-bold italic tracking-widest uppercase">Empty</div>
      </div>
    </div>
  </div>
</template>
