<template>
  <art
    title="Alert"
    description="Inline notice block for user feedback"
    components="./Alert.vue"
    category="feedback"
    tags="notice,status"
    status="ready"
  >
    <variant name="Info">
      <Alert tone="info">This is an informational message.</Alert>
    </variant>
    <variant name="Success">
      <Alert tone="success">The action completed successfully.</Alert>
    </variant>
    <variant name="Warning">
      <Alert tone="warning">Please double-check your input.</Alert>
    </variant>
  </art>
</template>

<script setup lang="ts">
import Alert from './Alert.vue';
</script>
