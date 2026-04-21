<template>
  <button class="switch" :class="{ 'switch--on': modelValue }" type="button">
    <span class="switch__thumb" />
  </button>
</template>

<script setup lang="ts">
defineProps<{ modelValue?: boolean }>();
</script>

<style scoped>
.switch {
  width: 44px;
  height: 26px;
  border-radius: 999px;
  border: 0;
  background: #d1d5db;
  padding: 3px;
}
.switch--on {
  background: #22c55e;
}
.switch__thumb {
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: white;
  transition: transform 0.2s ease;
}
.switch--on .switch__thumb {
  transform: translateX(18px);
}
</style>
