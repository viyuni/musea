<template>
  <art
    title="Badge"
    description="Small status label for status and categories"
    components="./Badge.vue"
    category="display"
    tags="status,label"
    status="ready"
  >
    <variant name="Neutral">
      <Badge tone="neutral">Default</Badge>
    </variant>
    <variant name="Success">
      <Badge tone="success">Online</Badge>
    </variant>
    <variant name="Warning">
      <Badge tone="warning">Pending</Badge>
    </variant>
    <variant name="Danger">
      <Badge tone="danger">Error</Badge>
    </variant>
  </art>
</template>

<script setup lang="ts">
import Badge from './Badge.vue';
</script>
