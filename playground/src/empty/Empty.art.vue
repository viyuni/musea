<template>
  <art
    title="Empty"
    description="No data state for empty or missing content"
    components="./Empty.vue"
    category="feedback"
    tags="empty,state"
    status="ready"
  >
    <variant name="Plain">
      <Empty>No results found.</Empty>
    </variant>
    <variant name="With Action">
      <Empty>Nothing here yet. Try adding an item.</Empty>
    </variant>
  </art>
</template>

<script setup lang="ts">
import Empty from './Empty.vue';
</script>
