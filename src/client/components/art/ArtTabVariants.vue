<script setup lang="ts">
import { computed } from 'vue';

import { ROUTES } from '../../../shared/constants.ts';
import type { ArtManifest } from '../../../types/index.ts';
import { useTheme } from '../../composables/use-theme.ts';
import { resolvePreviewUrl } from '../../utils/index.ts';
import PreviewFrame from '../common/PreviewFrame.vue';

const props = defineProps<{
  art?: ArtManifest | null;
}>();

const { activeTheme } = useTheme();

const url = computed(() => {
  const artId = props.art?.id;
  if (!artId) {
    return '';
  }

  const url = resolvePreviewUrl(ROUTES.frameVariant);

  url.searchParams.set('artId', artId);
  return url.toString();
});
</script>

<template>
  <div class="h-content">
    <PreviewFrame :theme="activeTheme" :src="url" class="size-full object-fill" loading="lazy" />
  </div>
</template>
