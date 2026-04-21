<template>
  <div class="avatar" :style="styleObject">
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ label: string; color?: string }>();
const styleObject = { background: props.color ?? '#111827' };
</script>

<style scoped>
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}
</style>
