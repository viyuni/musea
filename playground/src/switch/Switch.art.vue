<template>
  <art
    title="Switch"
    description="Boolean toggle control for on and off states"
    components="./Switch.vue"
    category="input"
    tags="toggle,form"
    status="ready"
  >
    <variant name="Off">
      <Switch />
    </variant>
    <variant name="On">
      <Switch :model-value="true" />
    </variant>
  </art>
</template>

<script setup lang="ts">
import Switch from './Switch.vue';
</script>
