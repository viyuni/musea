<template>
  <art
    title="Avatar"
    description="Circular user badge for profile identity"
    components="./Avatar.vue"
    category="data-display"
    tags="profile,user"
    status="ready"
  >
    <variant name="Initial">
      <Avatar label="M">M</Avatar>
    </variant>
    <variant name="Brand">
      <Avatar label="A" color="#2563eb">A</Avatar>
    </variant>
  </art>
</template>

<script setup lang="ts">
import Avatar from './Avatar.vue';
</script>
