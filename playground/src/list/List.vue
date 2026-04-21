<template>
  <ul class="list">
    <li v-for="item in list" :key="item" class="list__item">
      <slot :item="item">{{ item }}</slot>
    </li>
  </ul>
</template>

<script setup lang="ts">
defineProps<{
  /** 列表 */
  list: string[];
}>();
</script>

<style scoped>
.list {
  margin: 0;
  padding-left: 1.25rem;
}
.list__item {
  margin: 0.35rem 0;
}
</style>
