<script setup lang="ts">
import VariantFrame from './VariantFrame.vue';

defineProps<{
  artId: string;
  variantName?: string | null;
}>();
</script>

<template>
  <VariantFrame :art-id :variantName />
</template>
