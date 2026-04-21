<template>
  <art
    title="Progress"
    description="Linear progress bar for task completion"
    components="./Progress.vue"
    category="feedback"
    tags="progress,loading"
    status="ready"
  >
    <variant name="Quarter">
      <Progress :value="25" />
    </variant>
    <variant name="Half">
      <Progress :value="50" />
    </variant>
    <variant name="Full">
      <Progress :value="100" />
    </variant>
  </art>
</template>

<script setup lang="ts">
import Progress from './Progress.vue';
</script>
