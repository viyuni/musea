<template>
  <art
    title="List"
    description="Simple data list for repeated items"
    components="./List.vue"
    category="data-display"
    tags="list,items"
    status="ready"
  >
    <variant name="Default">
      <List :list="['Apple', 'Banana', 'Orange']" />
    </variant>
    <variant name="Custom">
      <List :list="['One', 'Two', 'Three']">
        <template #default="{ item }"> Item: {{ item }} </template>
      </List>
    </variant>
  </art>
</template>

<script setup lang="ts">
import List from './List.vue';
</script>
