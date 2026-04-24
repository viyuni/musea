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
  <div class="ms:space-y-12">
    <!-- Header with Theme Switcher -->
    <div v-if="variants.length" class="ms:flex ms:items-center ms:justify-between ms:mb-4">
      <div class="ms:text-[10px] ms:font-bold ms:uppercase ms:tracking-widest ms:opacity-30">
        {{ variants.length }} variants available
      </div>
      <ArtThemeSwitcher class="ms:bg-base-200/50 ms:rounded-lg ms:p-0.5" />
    </div>

    <div v-for="v in variants" :key="v.name" class="ms:space-y-4">
      <div class="ms:flex ms:items-center ms:gap-2 ms:px-1">
        <h3 class="ms:text-sm ms:font-bold ms:opacity-80 ms:uppercase ms:tracking-wider">
          {{ v.name }}
        </h3>
        <span
          v-if="v.default"
          class="ms:px-1.5 ms:py-0.5 ms:rounded ms:bg-primary/10 ms:text-primary ms:text-[10px] ms:font-bold ms:uppercase"
        >
          Default
        </span>
      </div>

      <div class="ms:border ms:border-base-300">
        <ArtPreview :url="v.url" height-mode="adaptive" />
      </div>
    </div>

    <div
      v-if="!variants.length"
      class="ms:flex ms:flex-col ms:items-center ms:justify-center ms:py-20 ms:text-base-content/40"
    >
      <p class="ms:text-sm">No variants found for this art.</p>
    </div>
  </div>
</template>
