<template>
  <span class="badge" :class="`badge--${tone}`">
    <slot />
  </span>
</template>

<script setup lang="ts">
defineProps<{
  /** This is the tone of the badge. */
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
}>();
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}
.badge--neutral {
  background: #eef2ff;
  color: #3730a3;
}
.badge--success {
  background: #dcfce7;
  color: #166534;
}
.badge--warning {
  background: #fef3c7;
  color: #92400e;
}
.badge--danger {
  background: #fee2e2;
  color: #991b1b;
}
</style>
