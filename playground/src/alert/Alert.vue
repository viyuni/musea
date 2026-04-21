<template>
  <div class="alert" :class="`alert--${tone}`">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tone?: 'info' | 'success' | 'warning';
}>();
</script>

<style scoped>
.alert {
  padding: 12px 14px;
  border-radius: 12px;
}
.alert--info {
  background: #eff6ff;
  color: #1d4ed8;
}
.alert--success {
  background: #ecfdf5;
  color: #047857;
}
.alert--warning {
  background: #fffbeb;
  color: #b45309;
}
</style>
