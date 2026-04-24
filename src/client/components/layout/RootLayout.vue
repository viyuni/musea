<script setup lang="ts">
import { Layers, Home, Component, Search, Monitor, Menu } from '@lucide/vue';
import { Sun, Moon } from '@lucide/vue';
import { computed, useTemplateRef } from 'vue';
import { useRoute } from 'vue-router';

import { useArtManifest } from '../../composables/use-art-manifest';
import { useTheme } from '../../composables/use-theme';
import MuseaLogo from '../common/MuseaLogo.vue';
import SearchModal from '../common/SearchModal.vue';

const searchModal = useTemplateRef('searchModal');
const drawerCheckbox = useTemplateRef<HTMLInputElement>('drawerCheckbox');
const { groupedArts } = useArtManifest();
const route = useRoute();
const { theme, setTheme } = useTheme();

const currentId = computed(() => route.params.id as string);
const currentTabQuery = computed(() => {
  const tab = route.query.tab;
  return typeof tab === 'string' ? { tab } : {};
});

const closeDrawer = () => {
  if (drawerCheckbox.value) {
    drawerCheckbox.value.checked = false;
  }
};
</script>

<template>
  <div class="ms:drawer ms:lg:drawer-open ms:h-full ms:font-sans">
    <input id="musea-drawer" ref="drawerCheckbox" type="checkbox" class="ms:drawer-toggle" />

    <!-- Main Content Area -->
    <div
      class="ms:drawer-content ms:flex ms:flex-col ms:overflow-hidden ms:bg-base-100 ms:relative"
    >
      <!-- Mobile Header (Visible only on mobile) -->
      <header
        class="ms:lg:hidden ms:h-14 ms:border-b ms:border-base-content/5 ms:flex ms:items-center ms:justify-between ms:px-4 ms:shrink-0 ms:bg-base-100/80 ms:backdrop-blur-xl ms:sticky ms:top-0 ms:z-40"
      >
        <div class="ms:flex ms:items-center ms:gap-3">
          <label for="musea-drawer" class="ms:btn ms:btn-ghost ms:btn-sm ms:btn-square">
            <Menu class="ms:size-5" />
          </label>
          <MuseaLogo width="80" />
        </div>

        <div class="ms:flex ms:items-center ms:gap-3">
          <!-- Small Theme Switcher for mobile -->
          <button
            v-if="theme === 'light'"
            class="ms:btn ms:btn-xs ms:btn-ghost ms:btn-square"
            @click="setTheme('auto')"
          >
            <Moon class="ms:size-4" />
          </button>
          <button
            v-else-if="theme === 'dark'"
            class="ms:btn ms:btn-xs ms:btn-ghost ms:btn-square"
            @click="setTheme('light')"
          >
            <Sun class="ms:size-4" />
          </button>

          <button
            v-else
            class="ms:btn ms:btn-xs ms:btn-ghost ms:btn-square"
            @click="setTheme('dark')"
          >
            <Monitor class="ms:size-4" />
          </button>

          <Search class="ms:size-4" @click="searchModal?.open" />
        </div>
      </header>

      <!-- View Container -->
      <main class="ms:flex-1 ms:relative ms:overflow-hidden">
        <RouterView v-slot="{ Component }">
          <transition
            enter-active-class="ms:transition ms:duration-150 ms:ease-out"
            enter-from-class="ms:opacity-0"
            enter-to-class="ms:opacity-100"
            leave-active-class="ms:transition ms:duration-100 ms:ease-in"
            leave-from-class="ms:opacity-100"
            leave-to-class="ms:opacity-0"
            mode="out-in"
          >
            <component :is="Component" :key="route.params.id || route.name" />
          </transition>
        </RouterView>
      </main>
    </div>

    <!-- Sidebar -->
    <div class="ms:drawer-side ms:z-50">
      <label for="musea-drawer" aria-label="close sidebar" class="ms:drawer-overlay"></label>
      <aside
        class="ms:w-64 ms:border-r ms:border-base-content/5 ms:flex ms:flex-col ms:shrink-0 ms:h-full ms:bg-base-100"
      >
        <!-- Sidebar Header: Logo + Theme Switcher -->
        <div
          class="ms:h-16 ms:flex ms:items-center ms:justify-between ms:px-6 ms:border-b ms:border-base-content/5 ms:gap-3 ms:shrink-0"
        >
          <MuseaLogo width="110" />

          <div class="ms:flex ms:items-center">
            <button
              v-if="theme === 'light'"
              class="ms:btn ms:btn-xs ms:btn-ghost ms:btn-square ms:rounded-lg"
              @click="setTheme('auto')"
            >
              <Moon class="ms:size-3.5 ms:text-indigo-400" />
            </button>
            <button
              v-else-if="theme === 'dark'"
              class="ms:btn ms:btn-xs ms:btn-ghost ms:btn-square ms:rounded-lg"
              @click="setTheme('light')"
            >
              <Sun class="ms:size-3.5 ms:text-amber-500" />
            </button>
            <button
              v-else
              class="ms:btn ms:btn-xs ms:btn-ghost ms:btn-square ms:rounded-lg"
              @click="setTheme('dark')"
            >
              <Monitor class="ms:size-3.5" />
            </button>
          </div>
        </div>

        <!-- Sidebar Search -->
        <div class="ms:p-3 ms:shrink-0">
          <SearchModal ref="searchModal" />
          <div
            class="ms:flex ms:items-center ms:gap-3 ms:px-3 ms:py-2 ms:rounded-xl ms:bg-base-content/2 ms:hover:bg-base-content/5 ms:cursor-pointer ms:transition-all ms:border ms:border-transparent ms:hover:border-base-content/5"
            @click="searchModal?.open"
          >
            <Search class="ms:size-3.5 ms:opacity-40" />
            <span class="ms:text-[10px] ms:font-black ms:uppercase ms:tracking-widest ms:opacity-30"
              >Search</span
            >
            <kbd class="ms:kbd ms:kbd-xs ms:ml-auto ms:opacity-50 ms:bg-base-100">⌘K</kbd>
          </div>
        </div>

        <nav class="ms:overflow-y-auto ms:flex-1">
          <ul class="ms:menu ms:w-full ms:p-2">
            <li class="ms:mb-2">
              <RouterLink
                :to="{ name: 'home' }"
                :class="{ 'menu-active': route.name === 'home' }"
                @click="closeDrawer"
              >
                <Home class="ms:size-3.5" />
                <span class="ms:text-[10px] ms:font-black ms:uppercase ms:tracking-[0.2em]">
                  Home
                </span>
              </RouterLink>
            </li>
            <li v-for="(items, category) in groupedArts" :key="category" class="ms:mb-2">
              <details open>
                <summary class="ms:group ms:flex ms:items-center ms:gap-2 ms:w-full">
                  <Layers class="ms:size-3.5 ms:transition-opacity" />

                  <span class="ms:text-[10px] ms:font-black ms:uppercase ms:tracking-[0.2em]">
                    {{ category }}
                  </span>

                  <span class="ms:badge ms:badge-xs ms:badge-ghost ms:ml-auto ms:font-mono">
                    {{ items.length }}
                  </span>
                </summary>

                <ul>
                  <li
                    v-for="item in items"
                    :key="item.id"
                    class="ms:rounded-md"
                    :class="{
                      'menu-active': currentId === item.id,
                    }"
                  >
                    <RouterLink
                      :to="{ name: 'art', params: { id: item.id }, query: currentTabQuery }"
                      class="ms:flex ms:items-center"
                      @click="closeDrawer"
                    >
                      <Component class="ms:size-3.5 ms:text-primary" />
                      <span class="ms:truncate">{{ item.title }}</span>
                    </RouterLink>
                  </li>
                </ul>
              </details>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  </div>
</template>
