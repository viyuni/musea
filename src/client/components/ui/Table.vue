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
    <h2
      v-if="title"
      class="ms:text-xl ms:select-none ms:font-black ms:mb-2 ms:uppercase ms:tracking-tighter"
    >
      {{ title }}
    </h2>

    <div v-if="list && list.length > 0" class="ms:w-full ms:overflow-x-auto">
      <table
        class="ms:table ms:min-w-200 ms:w-full ms:rounded-box ms:border ms:border-base-content/5 ms:bg-base-100"
      >
        <thead>
          <tr class="ms:text-base-content ms:text-[11px] ms:uppercase ms:tracking-widest">
            <th v-for="title in titles" :key="title">{{ title }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in list"
            :key="String(item[idKey])"
            class="ms:hover:bg-base-200/50 ms:transition-colors"
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
      class="ms:grid ms:place-items-center ms:p-4 ms:border ms:border-dashed ms:border-base-content/10 ms:rounded-box ms:bg-base-100"
    >
      <div class="ms:text-center">
        <div class="ms:text-base-content/30 ms:font-bold ms:italic ms:tracking-widest ms:uppercase">
          Empty
        </div>
      </div>
    </div>
  </div>
</template>
