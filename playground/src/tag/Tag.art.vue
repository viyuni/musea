<template>
  <art
    title="Tag"
    description="Neutral label chip for lightweight metadata"
    components="./Tag.vue"
    category="display"
    tags="chip,label"
    status="ready"
  >
    <variant name="Default">
      <Tag>Frontend</Tag>
    </variant>
    <variant name="Multiple">
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <Tag>Alpha</Tag>
        <Tag>Beta</Tag>
        <Tag>Stable</Tag>
      </div>
    </variant>
  </art>
</template>

<script setup lang="ts">
import Tag from './Tag.vue';
</script>
