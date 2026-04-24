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
    class="ms:ms-card ms:bg-base-100 ms:border ms:border-base-300 ms:transition-all ms:duration-200 ms:hover:border-primary/40 ms:hover:-translate-y-1 ms:hover:shadow-xl ms:group"
  >
    <div class="ms:ms-card-body ms:p-5 ms:gap-4">
      <div class="ms:flex ms:items-start ms:justify-between ms:gap-3">
        <h3
          class="ms:ms-card-title ms:text-xl ms:font-bold ms:group-hover:text-primary ms:transition-colors"
        >
          {{ data.title }}
        </h3>
        <ArtTag :status="data.status" />
      </div>

      <div class="ms:flex ms:flex-wrap ms:gap-1.5 ms:mt-auto">
        <div
          v-for="tag in data.tags"
          :key="tag"
          class="ms:ms-badge ms:ms-badge-sm ms:ms-badge-outline ms:opacity-70"
        >
          {{ tag }}
        </div>
      </div>

      <div
        class="ms:flex ms:items-center ms:justify-between ms:text-xs ms:font-medium ms:uppercase ms:tracking-wider ms:text-base-content/40"
      >
        <span>{{ data.category || 'Uncategorized' }}</span>
        <span>{{ data.variants?.length ?? 0 }} Variants</span>
      </div>
    </div>
  </RouterLink>
</template>
