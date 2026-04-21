<template>
  <div class="progress">
    <div class="progress__bar" :style="{ width: `${value}%` }" />
  </div>
</template>

<script setup lang="ts">
defineProps<{ value: number }>();
</script>

<style scoped>
.progress {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: #e5e7eb;
  overflow: hidden;
}
.progress__bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
}
</style>
