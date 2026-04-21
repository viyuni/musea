<script lang="ts" setup>
import Button from './Button.vue';
</script>

<template>
  <Art
    title="Button"
    description="Primary action trigger with size and color variants"
    :components="['./Button.vue']"
    :tests="['./Button.test.ts', './Button.extra.test.ts']"
    docs="./Button.art.md"
    category="input"
    tags="action,form"
    status="ready"
  >
    <Variant name="Primary" default>
      <Button color="primary" size="medium">Save Changes</Button>
    </Variant>

    <Variant name="Secondary">
      <Button color="secondary" size="medium">Cancel</Button>
    </Variant>

    <Variant name="Large">
      <Button color="primary" size="large">Continue</Button>
    </Variant>
  </Art>
</template>
