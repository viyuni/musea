<script setup lang="ts">
import { computed } from 'vue';

import { ROUTES } from '../../../shared/constants.ts';
import type { ArtManifest } from '../../../types/index.ts';
import { resolvePreviewUrl } from '../../utils/index.ts';
import ArtPreview from './ArtPreview.vue';
import ArtThemeSwitcher from './ArtThemeSwitcher.vue';

const props = defineProps<{
  art?: ArtManifest | null;
}>();

function resolveVariantUrl(artId: string, variant?: string) {
  const url = resolvePreviewUrl(ROUTES.frameVariant);

  url.searchParams.set('artId', artId);

  if (variant) url.searchParams.set('variant', variant);

  return url.toString();
}

const variants = computed(() => {
  const art = props.art;
  if (!art || !art.variants) return [];

  return art.variants.map((v) => ({
    ...v,
    url: resolveVariantUrl(art.id, v.name),
  }));
});
</script>

<template>
  <div class="space-y-12">
    <!-- Header with Theme Switcher -->
    <div v-if="variants.length" class="flex items-center justify-between mb-4">
      <div class="text-[10px] font-bold uppercase tracking-widest opacity-30">
        {{ variants.length }} variants available
      </div>
      <ArtThemeSwitcher class="bg-base-200/50 rounded-lg p-0.5" />
    </div>

    <div v-for="v in variants" :key="v.name" class="space-y-4">
      <div class="flex items-center gap-2 px-1">
        <h3 class="text-sm font-bold opacity-80 uppercase tracking-wider">
          {{ v.name }}
        </h3>
        <span
          v-if="v.default"
          class="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase"
        >
          Default
        </span>
      </div>

      <div class="border border-base-300">
        <ArtPreview :url="v.url" height-mode="adaptive" />
      </div>
    </div>

    <div
      v-if="!variants.length"
      class="flex flex-col items-center justify-center py-20 text-base-content/40"
    >
      <p class="text-sm">No variants found for this art.</p>
    </div>
  </div>
</template>
