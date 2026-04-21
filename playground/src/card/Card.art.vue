<template>
  <art
    title="Card"
    description="Simple content container for grouped information"
    components="./Card.vue"
    category="layout"
    tags="container,content"
    status="ready"
    docs="./Card.art.md"
  >
    <variant name="Basic">
      <Card>
        <template #title>Welcome</template>
        Hello from the card.
      </Card>
    </variant>
    <variant name="With Body">
      <Card>
        <template #title>Summary</template>
        A little bit of supporting text for the card body.
      </Card>
    </variant>
  </art>
</template>

<script setup lang="ts">
import Card from './Card.vue';
</script>
