<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import ArtTab from '../components/art/ArtTab.vue';
import { useArtDoc } from '../composables/use-art-doc';
import { useArtManifest } from '../composables/use-art-manifest';

const route = useRoute();
const { arts } = useArtManifest();

const id = computed(() => route.params.id as string);
const currentArt = computed(() => arts.value.find((art) => art.id === id.value));
const { artDoc } = useArtDoc(() => currentArt.value?.id);
</script>

<template>
  <main class="vi:h-full vi:overflow-y-auto vi:overflow-x-hidden vi:font-sans vi:scroll-smooth">
    <ArtTab :art="currentArt" :docs="artDoc" />
  </main>
</template>
