<script setup lang="ts">
import { museaConfig } from 'virtual:musea-config';
import { computed } from 'vue';

import VariantFrame from './VariantFrame.vue';
import VariantInline from './VariantInline.vue';

const props = defineProps<{
  artId: string;
  variantName: string;
}>();

const VariantComponent = computed(() => {
  return museaConfig.variantRenderMode === 'inline' ? VariantInline : VariantFrame;
});
</script>

<template>
  <component :is="VariantComponent" :art-id="props.artId" :variant-name="props.variantName" />
</template>
