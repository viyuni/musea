<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import type { ArtManifest } from '../../../../types';
import ArtTag from './ArtTag.vue';

defineProps<{
  data: ArtManifest;
}>();

const route = useRoute();
const currentTabQuery = computed(() => {
  const tab = route.query.tab;
  return typeof tab === 'string' ? { tab } : {};
});
</script>

<template>
  <RouterLink
    :to="{ name: 'art', params: { id: data.id }, query: currentTabQuery }"
    class="vi:vi-card vi:bg-base-100 vi:border vi:border-base-300 vi:transition-all vi:duration-200 vi:hover:border-primary/40 vi:hover:-translate-y-1 vi:hover:shadow-xl vi:group"
  >
    <div class="vi:vi-card-body vi:p-5 vi:gap-4">
      <div class="vi:flex vi:items-start vi:justify-between vi:gap-3">
        <h3
          class="vi:vi-card-title vi:text-xl vi:font-bold vi:group-hover:text-primary vi:transition-colors"
        >
          {{ data.title }}
        </h3>
        <ArtTag :status="data.status" />
      </div>

      <div class="vi:flex vi:flex-wrap vi:gap-1.5 vi:mt-auto">
        <div
          v-for="tag in data.tags"
          :key="tag"
          class="vi:vi-badge vi:vi-badge-sm vi:vi-badge-outline vi:opacity-70"
        >
          {{ tag }}
        </div>
      </div>

      <div
        class="vi:flex vi:items-center vi:justify-between vi:text-xs vi:font-medium vi:uppercase vi:tracking-wider vi:text-base-content/40"
      >
        <span>{{ data.category || 'Uncategorized' }}</span>
        <span>{{ data.variants?.length ?? 0 }} Variants</span>
      </div>
    </div>
  </RouterLink>
</template>
