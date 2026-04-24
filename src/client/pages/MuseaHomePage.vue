<script setup lang="ts">
import ArtCard from '../components/art/ArtCard.vue';
import { useArtManifest } from '../composables/use-art-manifest';

const { arts, totalVariants, categoryCount, totalArts } = useArtManifest();
</script>

<template>
  <main class="ms:h-full ms:overflow-y-auto ms:scroll-smooth">
    <div class="ms:w-full ms:px-4 ms:py-4 ms:lg:px-8 ms:lg:py-8">
      <header
        class="ms:flex ms:flex-col ms:lg:flex-row ms:lg:items-center ms:justify-between ms:gap-8 ms:mb-12"
      >
        <div class="ms:space-y-2">
          <h1 class="ms:text-4xl ms:font-black ms:tracking-tighter">Overview</h1>
          <p class="ms:text-sm ms:text-base-content/50 ms:max-w-2xl ms:leading-relaxed">
            Welcome to the <span class="ms:text-primary ms:font-bold">Musea Art Gallery</span>.
            Explore and preview your Arts across
            <span class="ms:font-bold ms:text-base-content">{{ categoryCount }}</span> categories.
          </p>
        </div>

        <div class="ms:stats ms:stats-horizontal">
          <div class="ms:stat ms:py-3 ms:px-6">
            <div class="ms:stat-title ms:text-[10px] ms:uppercase ms:font-black ms:tracking-widest">
              Total Arts
            </div>
            <div class="ms:stat-value ms:text-2xl ms:font-black ms:text-primary ms:text-center">
              {{ totalArts }}
            </div>
          </div>
          <div class="ms:stat ms:py-3 ms:px-6">
            <div class="ms:stat-title ms:text-[10px] ms:uppercase ms:font-black ms:tracking-widest">
              Total Variants
            </div>
            <div class="ms:stat-value ms:text-2xl ms:font-black ms:text-center">
              {{ totalVariants }}
            </div>
          </div>
        </div>
      </header>

      <div v-if="arts.length === 0" class="ms:py-32 ms:text-center ms:space-y-6">
        <div class="ms:text-8xl ms:opacity-10 ms:font-black">EMPTY</div>
        <p class="ms:text-base-content/40 ms:font-medium">No Arts found in your workspace yet.</p>
      </div>

      <div
        v-else
        class="ms:grid ms:grid-cols-1 ms:sm:grid-cols-2 ms:md:grid-cols-3 ms:lg:grid-cols-4 ms:xl:grid-cols-5 ms:2xl:grid-cols-6 ms:gap-6"
      >
        <ArtCard v-for="item in arts" :key="item.id" :data="item" class="ms:animate-pop-in" />
      </div>
    </div>
  </main>
</template>
