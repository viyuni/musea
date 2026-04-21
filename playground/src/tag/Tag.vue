<template>
  <span class="tag">
    <slot />
  </span>
</template>

<style scoped>
.tag {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #374151;
  font-size: 12px;
}
</style>
