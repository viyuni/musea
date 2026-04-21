<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import type { ArtManifest } from '../../../types';
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
    class="card bg-base-100 border border-base-300 transition-all duration-200 hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl group"
  >
    <div class="card-body p-5 gap-4">
      <div class="flex items-start justify-between gap-3">
        <h3 class="card-title text-xl font-bold group-hover:text-primary transition-colors">
          {{ data.title }}
        </h3>
        <ArtTag :status="data.status" />
      </div>

      <div class="flex flex-wrap gap-1.5 mt-auto">
        <div v-for="tag in data.tags" :key="tag" class="badge badge-sm badge-outline opacity-70">
          {{ tag }}
        </div>
      </div>

      <div
        class="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-base-content/40"
      >
        <span>{{ data.category || 'Uncategorized' }}</span>
        <span>{{ data.variants?.length ?? 0 }} Variants</span>
      </div>
    </div>
  </RouterLink>
</template>
