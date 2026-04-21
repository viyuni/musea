<script setup lang="ts">
import ArtCard from '../components/art/ArtCard.vue';
import { useArtManifest } from '../composables/use-art-manifest';

const { arts, totalVariants, categoryCount, totalArts } = useArtManifest();
</script>

<template>
  <main class="h-full overflow-y-auto scroll-smooth">
    <div class="w-full px-4 py-4 lg:px-8 lg:py-8">
      <header class="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div class="space-y-2">
          <h1 class="text-4xl font-black tracking-tighter">Overview</h1>
          <p class="text-sm text-base-content/50 max-w-2xl leading-relaxed">
            Welcome to the <span class="text-primary font-bold">Musea Art Gallery</span>. Explore
            and preview your Arts across
            <span class="font-bold text-base-content">{{ categoryCount }}</span> categories.
          </p>
        </div>

        <div class="stats stats-horizontal">
          <div class="stat py-3 px-6">
            <div class="stat-title text-[10px] uppercase font-black tracking-widest">
              Total Arts
            </div>
            <div class="stat-value text-2xl font-black text-primary text-center">
              {{ totalArts }}
            </div>
          </div>
          <div class="stat py-3 px-6">
            <div class="stat-title text-[10px] uppercase font-black tracking-widest">
              Total Variants
            </div>
            <div class="stat-value text-2xl font-black text-center">{{ totalVariants }}</div>
          </div>
        </div>
      </header>

      <div v-if="arts.length === 0" class="py-32 text-center space-y-6">
        <div class="text-8xl opacity-10 font-black">EMPTY</div>
        <p class="text-base-content/40 font-medium">No Arts found in your workspace yet.</p>
      </div>

      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6"
      >
        <ArtCard v-for="item in arts" :key="item.id" :data="item" class="animate-pop-in" />
      </div>
    </div>
  </main>
</template>
