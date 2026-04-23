<template>
  <link rel="stylesheet" :href="styleHref" />
  <div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
declare const __MUSEA_STYLE_LINK__: string;

const styleHref = __MUSEA_STYLE_LINK__;
</script>
