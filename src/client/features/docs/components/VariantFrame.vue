<script setup lang="ts">
import { computed } from 'vue';

import { ROUTES } from '../../../../shared/constants';
import IframeView from '../../../shared/components/IframeView.vue';
import { useTheme } from '../../../shared/composables/use-theme';
import { resolvePreviewUrl } from '../../../utils';

const props = defineProps<{
  artId: string;
  variantName?: string | null;
}>();

const { activeTheme } = useTheme();

function resolveVariantUrl(artId: string, variant?: string) {
  const url = resolvePreviewUrl(ROUTES.frameVariant);

  url.searchParams.set('artId', artId);

  if (variant) url.searchParams.set('variant', variant);

  return url.toString();
}

const url = computed(() => resolveVariantUrl(props.artId, props.variantName ?? ''));
</script>

<template>
  <IframeView :url :fill="true" :theme="activeTheme" class="vi:w-full" placeholder-height="60px" />
</template>
