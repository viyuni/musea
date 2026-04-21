<template>
  <button
    class="button"
    :class="Object.values($props)"
    @click="
      () => {
        $emit('update', 1, 'ok');
        $emit('click', 2);
      }
    "
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import type { ButtonEmits, ButtonProps } from './types';

defineOptions({ name: 'Button' });
withDefaults(defineProps<ButtonProps>(), {
  size: 'medium',
  color: 'primary',
});
defineEmits<ButtonEmits>();
</script>

<style scoped>
.button.primary {
  background-color: #e2588d;
}

.button.secondary {
  background-color: #2b3139;
}

.button {
  padding: 0.5em 1em;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.1s opacity;
  border: none;
}

.button:hover {
  opacity: 0.9;
}

.button:active {
  transform: translateY(1px);
}

.button.small {
  font-size: 0.8em;
  padding: 0.4em 0.8em;
}

.button.medium {
  font-size: 1em;
  padding: 0.6em 1.2em;
}

.button.large {
  font-size: 1.2em;
  padding: 0.8em 1.4em;
}
</style>
