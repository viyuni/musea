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
  <div class="drawer lg:drawer-open h-full font-sans">
    <input id="musea-drawer" ref="drawerCheckbox" type="checkbox" class="drawer-toggle" />

    <!-- Main Content Area -->
    <div class="drawer-content flex flex-col overflow-hidden bg-base-100 relative">
      <!-- Mobile Header (Visible only on mobile) -->
      <header
        class="lg:hidden h-14 border-b border-base-content/5 flex items-center justify-between px-4 shrink-0 bg-base-100/80 backdrop-blur-xl sticky top-0 z-40"
      >
        <div class="flex items-center gap-3">
          <label for="musea-drawer" class="btn btn-ghost btn-sm btn-square">
            <Menu class="size-5" />
          </label>
          <MuseaLogo width="80" />
        </div>

        <div class="flex items-center gap-3">
          <!-- Small Theme Switcher for mobile -->
          <button
            v-if="theme === 'light'"
            class="btn btn-xs btn-ghost btn-square"
            @click="setTheme('auto')"
          >
            <Moon class="size-4" />
          </button>
          <button
            v-else-if="theme === 'dark'"
            class="btn btn-xs btn-ghost btn-square"
            @click="setTheme('light')"
          >
            <Sun class="size-4" />
          </button>

          <button v-else class="btn btn-xs btn-ghost btn-square" @click="setTheme('dark')">
            <Monitor class="size-4" />
          </button>

          <Search class="size-4" @click="searchModal?.open" />
        </div>
      </header>

      <!-- View Container -->
      <main class="flex-1 relative overflow-hidden">
        <RouterView v-slot="{ Component }">
          <transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
            mode="out-in"
          >
            <component :is="Component" :key="route.params.id || route.name" />
          </transition>
        </RouterView>
      </main>
    </div>

    <!-- Sidebar -->
    <div class="drawer-side z-50">
      <label for="musea-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
      <aside class="w-64 border-r border-base-content/5 flex flex-col shrink-0 h-full bg-base-100">
        <!-- Sidebar Header: Logo + Theme Switcher -->
        <div
          class="h-16 flex items-center justify-between px-6 border-b border-base-content/5 gap-3 shrink-0"
        >
          <MuseaLogo width="110" />

          <div class="flex items-center">
            <button
              v-if="theme === 'light'"
              class="btn btn-xs btn-ghost btn-square rounded-lg"
              @click="setTheme('auto')"
            >
              <Moon class="size-3.5 text-indigo-400" />
            </button>
            <button
              v-else-if="theme === 'dark'"
              class="btn btn-xs btn-ghost btn-square rounded-lg"
              @click="setTheme('light')"
            >
              <Sun class="size-3.5 text-amber-500" />
            </button>
            <button
              v-else
              class="btn btn-xs btn-ghost btn-square rounded-lg"
              @click="setTheme('dark')"
            >
              <Monitor class="size-3.5" />
            </button>
          </div>
        </div>

        <!-- Sidebar Search -->
        <div class="p-3 shrink-0">
          <SearchModal ref="searchModal" />
          <div
            class="flex items-center gap-3 px-3 py-2 rounded-xl bg-base-content/2 hover:bg-base-content/5 cursor-pointer transition-all border border-transparent hover:border-base-content/5"
            @click="searchModal?.open"
          >
            <Search class="size-3.5 opacity-40" />
            <span class="text-[10px] font-black uppercase tracking-widest opacity-30">Search</span>
            <kbd class="kbd kbd-xs ml-auto opacity-50 bg-base-100">⌘K</kbd>
          </div>
        </div>

        <nav class="overflow-y-auto flex-1">
          <ul class="menu w-full p-2">
            <li class="mb-2">
              <RouterLink
                :to="{ name: 'home' }"
                :class="{ 'menu-active': route.name === 'home' }"
                @click="closeDrawer"
              >
                <Home class="size-3.5" />
                <span class="text-[10px] font-black uppercase tracking-[0.2em]"> Home </span>
              </RouterLink>
            </li>
            <li v-for="(items, category) in groupedArts" :key="category" class="mb-2">
              <details open>
                <summary class="group flex items-center gap-2 w-full">
                  <Layers class="size-3.5 transition-opacity" />

                  <span class="text-[10px] font-black uppercase tracking-[0.2em]">
                    {{ category }}
                  </span>

                  <span class="badge badge-xs badge-ghost ml-auto font-mono">
                    {{ items.length }}
                  </span>
                </summary>

                <ul>
                  <li
                    v-for="item in items"
                    :key="item.id"
                    class="rounded-md"
                    :class="{
                      'menu-active': currentId === item.id,
                    }"
                  >
                    <RouterLink
                      :to="{ name: 'art', params: { id: item.id }, query: currentTabQuery }"
                      class="flex items-center"
                      @click="closeDrawer"
                    >
                      <Component class="size-3.5 text-primary" />
                      <span class="truncate">{{ item.title }}</span>
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
