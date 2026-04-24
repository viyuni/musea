import { createApp } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router';

import { IS_UNPACKED } from '../shared/constants';
import MuseaApp from './App.vue';

const __ = IS_UNPACKED ? import('./style.css') : import('virtual:musea-style');

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('./layouts/RootLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('./pages/HomePage.vue'),
      },
      {
        path: ':id(.*)',
        name: 'art',
        component: () => import('./pages/ArtPage.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

const app = createApp(MuseaApp);
app.use(router);
app.mount('#musea-app');
