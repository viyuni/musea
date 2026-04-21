<script lang="ts" setup>
import Example from './Example.vue';
import Example2 from './Example2.vue';
</script>

<template>
  <Art
    title="Example"
    description="Minimal showcase component for typography and color experiments"
    :components="['./Example.vue', './Example2.vue']"
    category="display"
    tags="demo,typography"
    status="ready"
  >
    <Variant name="Default" default>
      <Example :size="30">Hello Musea</Example>
    </Variant>

    <Variant name="Large">
      <Example :size="40">Large Text</Example>
    </Variant>

    <Variant name="Accent Color">
      <Example2 color="#2563eb">Accent Demo</Example2>
    </Variant>
  </Art>
</template>
