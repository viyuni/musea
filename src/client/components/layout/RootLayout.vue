<script setup lang="ts">
import {
  Layers,
  Home,
  Component,
  Search,
  Monitor,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from '@lucide/vue';
import { Sun, Moon } from '@lucide/vue';
import { computed, useTemplateRef } from 'vue';
import { useRoute } from 'vue-router';

import { useArtManifest } from '../../composables/use-art-manifest';
import { useSidebar } from '../../composables/use-sidebar';
import { useTheme } from '../../composables/use-theme';
import MuseaLogo from '../common/MuseaLogo.vue';
import SearchModal from '../common/SearchModal.vue';

const searchModal = useTemplateRef('searchModal');
const drawerCheckbox = useTemplateRef<HTMLInputElement>('drawerCheckbox');
const { groupedArts } = useArtManifest();
const { isSidebarOpen, toggleSidebar } = useSidebar();
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
  <div
    class="vi:vi-drawer vi:h-full vi:font-sans"
    :class="{ 'vi:lg:vi-drawer-open': isSidebarOpen }"
  >
    <input id="musea-drawer" ref="drawerCheckbox" type="checkbox" class="vi:vi-drawer-toggle" />

    <!-- Main Content Area -->
    <div
      class="vi:vi-drawer-content vi:flex vi:flex-col vi:overflow-hidden vi:bg-base-100 vi:relative"
    >
      <!-- Mobile Header (Visible only on mobile) -->
      <header
        class="vi:lg:hidden vi:h-14 vi:border-b vi:border-base-content/5 vi:flex vi:items-center vi:justify-between vi:px-4 vi:shrink-0 vi:bg-base-100/80 vi:backdrop-blur-xl vi:sticky vi:top-0 vi:z-40"
      >
        <div class="vi:flex vi:items-center vi:gap-3">
          <label for="musea-drawer" class="vi:vi-btn vi:vi-btn-ghost vi:vi-btn-sm vi:vi-btn-square">
            <Menu class="vi:size-5" />
          </label>
          <MuseaLogo width="80" />
        </div>

        <div class="vi:flex vi:items-center vi:gap-3">
          <!-- Small Theme Switcher for mobile -->
          <button
            v-if="theme === 'light'"
            class="vi:vi-btn vi:vi-btn-xs vi:vi-btn-ghost vi:vi-btn-square"
            @click="setTheme('auto')"
          >
            <Moon class="vi:size-4" />
          </button>
          <button
            v-else-if="theme === 'dark'"
            class="vi:vi-btn vi:vi-btn-xs vi:vi-btn-ghost vi:vi-btn-square"
            @click="setTheme('light')"
          >
            <Sun class="vi:size-4" />
          </button>

          <button
            v-else
            class="vi:vi-btn vi:vi-btn-xs vi:vi-btn-ghost vi:vi-btn-square"
            @click="setTheme('dark')"
          >
            <Monitor class="vi:size-4" />
          </button>

          <Search class="vi:size-4" @click="searchModal?.open" />
        </div>
      </header>

      <!-- View Container -->
      <main class="vi:flex-1 vi:relative vi:overflow-hidden">
        <RouterView v-slot="{ Component }">
          <transition
            enter-active-class="vi:transition vi:duration-150 vi:ease-out"
            enter-from-class="vi:opacity-0"
            enter-to-class="vi:opacity-100"
            leave-active-class="vi:transition vi:duration-100 vi:ease-in"
            leave-from-class="vi:opacity-100"
            leave-to-class="vi:opacity-0"
            mode="out-in"
          >
            <component :is="Component" :key="route.params.id || route.name" />
          </transition>
        </RouterView>
      </main>
    </div>

    <!-- Sidebar -->
    <div class="vi:vi-drawer-side vi:z-50">
      <label for="musea-drawer" aria-label="close sidebar" class="vi:vi-drawer-overlay"></label>
      <aside
        class="vi:w-64 vi:border-r vi:border-base-content/5 vi:flex vi:flex-col vi:shrink-0 vi:h-full vi:bg-base-100"
      >
        <!-- Sidebar Header: Logo + Theme Switcher -->
        <div
          class="vi:h-16 vi:flex vi:items-center vi:justify-between vi:px-4 vi:border-b vi:border-base-content/5 vi:shrink-0 vi:gap-2"
        >
          <MuseaLogo width="100" />

          <div class="vi:flex vi:items-center vi:gap-1">
            <button
              v-if="theme === 'light'"
              class="vi:vi-btn vi:vi-btn-sm vi:vi-btn-ghost vi:vi-btn-square vi:rounded-lg"
              @click="setTheme('auto')"
            >
              <Moon class="vi:size-4 vi:text-indigo-400" />
            </button>
            <button
              v-else-if="theme === 'dark'"
              class="vi:vi-btn vi:vi-btn-sm vi:vi-btn-ghost vi:vi-btn-square vi:rounded-lg"
              @click="setTheme('light')"
            >
              <Sun class="vi:size-4 vi:text-amber-500" />
            </button>
            <button
              v-else
              class="vi:vi-btn vi:vi-btn-sm vi:vi-btn-ghost vi:vi-btn-square vi:rounded-lg"
              @click="setTheme('dark')"
            >
              <Monitor class="vi:size-4" />
            </button>

            <button
              class="vi:hidden vi:lg:block vi:vi-btn vi:vi-btn-sm vi:vi-btn-ghost vi:vi-btn-square vi:rounded-lg vi:hover:vi-bg-base-content/10"
              title="Collapse Sidebar"
              @click="toggleSidebar"
            >
              <PanelLeftClose class="vi:size-4" />
            </button>
          </div>
        </div>

        <!-- Sidebar Search -->
        <div class="vi:p-3 vi:shrink-0">
          <SearchModal ref="searchModal" />
          <div
            class="vi:flex vi:items-center vi:gap-3 vi:px-3 vi:py-2 vi:rounded-xl vi:bg-base-content/2 vi:hover:bg-base-content/5 vi:cursor-pointer vi:transition-all vi:border vi:border-transparent vi:hover:border-base-content/5"
            @click="searchModal?.open"
          >
            <Search class="vi:size-3.5 vi:opacity-40" />
            <span class="vi:text-[10px] vi:font-black vi:uppercase vi:tracking-widest vi:opacity-30"
              >Search</span
            >
            <kbd class="vi:vi-kbd vi:vi-kbd-xs vi:ml-auto vi:opacity-50 vi:bg-base-100">⌘K</kbd>
          </div>
        </div>

        <nav class="vi:overflow-y-auto vi:flex-1">
          <ul class="vi:vi-menu vi:w-full vi:p-2">
            <li class="vi:mb-2">
              <RouterLink
                :to="{ name: 'home' }"
                :class="{ 'vi:vi-menu-active': route.name === 'home' }"
                @click="closeDrawer"
              >
                <Home class="vi:size-3.5" />
                <span class="vi:text-[10px] vi:font-black vi:uppercase vi:tracking-[0.2em]">
                  Home
                </span>
              </RouterLink>
            </li>
            <li v-for="(items, category) in groupedArts" :key="category" class="vi:mb-2">
              <details open>
                <summary class="vi:group vi:flex vi:items-center vi:gap-2 vi:w-full">
                  <Layers class="vi:size-3.5 vi:transition-opacity" />

                  <span class="vi:text-[10px] vi:font-black vi:uppercase vi:tracking-[0.2em]">
                    {{ category }}
                  </span>

                  <span
                    class="vi:vi-badge vi:vi-badge-xs vi:vi-badge-ghost vi:ml-auto vi:font-mono"
                  >
                    {{ items.length }}
                  </span>
                </summary>

                <ul>
                  <li
                    v-for="item in items"
                    :key="item.id"
                    class="vi:rounded-md"
                    :class="{
                      'vi:vi-menu-active': currentId === item.id,
                    }"
                  >
                    <RouterLink
                      :to="{ name: 'art', params: { id: item.id }, query: currentTabQuery }"
                      class="vi:flex vi:items-center"
                      @click="closeDrawer"
                    >
                      <Component class="vi:size-3.5 vi:text-primary" />
                      <span class="vi:truncate">{{ item.title }}</span>
                    </RouterLink>
                  </li>
                </ul>
              </details>
            </li>
          </ul>
        </nav>
      </aside>
    </div>

    <!-- Floating Button -->
    <div>
      <button
        class="vi:vi-btn vi:vi-btn-circle vi:fixed vi:bottom-[50svh] vi:-translate-y-1/2 vi:tri vi:left-5 vi:drop-shadow-2xl vi:lg:flex vi:hidden"
        @click="toggleSidebar"
      >
        <PanelLeftOpen class="vi:size-4" />
      </button>
    </div>
  </div>
</template>
