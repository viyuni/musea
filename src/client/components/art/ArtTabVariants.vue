<script setup lang="ts">
import { computed } from 'vue';

import { ROUTES } from '../../../shared/constants.ts';
import type { ArtManifest } from '../../../types/index.ts';
import { resolvePreviewUrl } from '../../utils/index.ts';
import ArtThemeSwitcher from './ArtThemeSwitcher.vue';
import ArtVariantFrame from './ArtVariantFrame.vue';

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
  <div class="vi:space-y-12">
    <!-- Header with Theme Switcher -->
    <div v-if="variants.length" class="vi:flex vi:items-center vi:justify-between vi:mb-4">
      <div class="vi:text-[10px] vi:font-bold vi:uppercase vi:tracking-widest vi:opacity-30">
        {{ variants.length }} variants available
      </div>
    </div>

    <div v-for="v in variants" :key="v.name" class="vi:space-y-4">
      <div class="vi:flex vi:items-center vi:gap-2 vi:px-1">
        <h3 class="vi:text-sm vi:font-bold vi:opacity-80 vi:uppercase vi:tracking-wider">
          {{ v.name }}
        </h3>
        <span
          v-if="v.default"
          class="vi:px-1.5 vi:py-0.5 vi:rounded vi:bg-primary/10 vi:text-primary vi:text-[10px] vi:font-bold vi:uppercase"
        >
          Default
        </span>

        <h3>{{ v.description }}</h3>
      </div>

      <ArtVariantFrame :url="v.url" />
    </div>

    <div
      v-if="!variants.length"
      class="vi:flex vi:flex-col vi:items-center vi:justify-center vi:py-20 vi:text-base-content/40"
    >
      <p class="vi:text-sm">No variants found for this art.</p>
    </div>
  </div>
</template>
