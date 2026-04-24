<script setup lang="ts">
import ArtCard from '../components/art/ArtCard.vue';
import { useArtManifest } from '../composables/use-art-manifest';

const { arts, totalVariants, categoryCount, totalArts } = useArtManifest();
</script>

<template>
  <main class="vi:h-full vi:overflow-y-auto vi:scroll-smooth">
    <div class="vi:w-full vi:px-4 vi:py-4 vi:lg:px-8 vi:lg:py-8">
      <header
        class="vi:flex vi:flex-col vi:lg:flex-row vi:lg:items-center vi:justify-between vi:gap-8 vi:mb-12"
      >
        <div class="vi:space-y-2">
          <h1 class="vi:text-4xl vi:font-black vi:tracking-tighter">Overview</h1>
          <p class="vi:text-sm vi:text-base-content/50 vi:max-w-2xl vi:leading-relaxed">
            Welcome to the <span class="vi:text-primary vi:font-bold">Musea Art Gallery</span>.
            Explore and preview your Arts across
            <span class="vi:font-bold vi:text-base-content">{{ categoryCount }}</span> categories.
          </p>
        </div>

        <div class="vi:vi-stats vi:vi-stats-horizontal">
          <div class="vi:vi-stat vi:py-3 vi:px-6">
            <div
              class="vi:vi-stat-title vi:text-[10px] vi:uppercase vi:font-black vi:tracking-widest"
            >
              Total Arts
            </div>
            <div class="vi:vi-stat-value vi:text-2xl vi:font-black vi:text-primary vi:text-center">
              {{ totalArts }}
            </div>
          </div>
          <div class="vi:vi-stat vi:py-3 vi:px-6">
            <div
              class="vi:vi-stat-title vi:text-[10px] vi:uppercase vi:font-black vi:tracking-widest"
            >
              Total Variants
            </div>
            <div class="vi:vi-stat-value vi:text-2xl vi:font-black vi:text-center">
              {{ totalVariants }}
            </div>
          </div>
        </div>
      </header>

      <div v-if="arts.length === 0" class="vi:py-32 vi:text-center vi:space-y-6">
        <div class="vi:text-8xl vi:opacity-10 vi:font-black">EMPTY</div>
        <p class="vi:text-base-content/40 vi:font-medium">No Arts found in your workspace yet.</p>
      </div>

      <div
        v-else
        class="vi:grid vi:grid-cols-1 vi:sm:grid-cols-2 vi:md:grid-cols-3 vi:lg:grid-cols-4 vi:xl:grid-cols-5 vi:2xl:grid-cols-6 vi:gap-6"
      >
        <ArtCard v-for="item in arts" :key="item.id" :data="item" class="vi:animate-pop-in" />
      </div>
    </div>
  </main>
</template>
