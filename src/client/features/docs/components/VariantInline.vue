<script setup lang="ts">
import { computed } from 'vue';

import { loadVariantComponent } from '../../art/composables/use-art-manifest';

const props = defineProps<{
  artId: string;
  variantName: string;
}>();

const VariantComponent = computed(() => loadVariantComponent(props.artId, props.variantName ?? ''));
</script>

<template>
  <VariantComponent />
</template>
