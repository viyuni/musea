import { createApp } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router';

import { IS_UNPACKED } from '../shared/constants';
import MuseaApp from './MuseaApp.vue';

const __ = IS_UNPACKED ? import('./style.css') : import('virtual:musea-style');

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('./components/layout/RootLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('./pages/MuseaHomePage.vue'),
      },
      {
        path: ':id(.*)',
        name: 'art',
        component: () => import('./pages/MuseaArtPage.vue'),
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
