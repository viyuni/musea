<script lang="ts" setup>
defineProps<{
  color: string;
}>();
</script>

<template>
  <div :style="{ color }">
    <slot></slot>
  </div>
</template>
