<script lang="ts" setup>
defineProps<{
  size: number;
}>();
</script>

<template>
  <div :style="{ fontSize: `${size}px` }">
    <slot></slot>
  </div>
</template>
