import { defineVirtualModule } from './utils.ts';

declare const __IS_UNPACKED__: boolean;

/**
 * Is pack
 */
export const IS_UNPACKED = typeof __IS_UNPACKED__ !== 'undefined' ? __IS_UNPACKED__ : true;

/**
 * H3 routes
 */
export const ROUTES = {
  BASE: '/',
  FRAME_VARIANT: '/frame/variant',
  FRAME_COMPONENT: '/frame/component',
  OPEN_IN_EDITOR: '/open-in-editor',
  TESTS_RUN: '/tests/run',
  TESTS_API: '/tests/api',
} as const;

/**
 * Vite hot events
 */
export const MUSEA_HOT_EVENTS = {
  docsUpdate: 'musea:docs-update',
  manifestUpdate: 'musea:manifest-update',
  testsUpdate: 'musea:tests-update',
} as const;

/**
 * Art manifest virtual module
 */
export const VIRTUAL_ART_MANIFEST = defineVirtualModule('virtual:musea-manifest');

/**
 * Docs manifest virtual module
 */
export const VIRTUAL_DOCS = defineVirtualModule('virtual:musea-docs');

/**
 * Art variant render virtual module
 */
export const VIRTUAL_ART_VARIANT_RENDER = defineVirtualModule(
  'virtual:musea-art-variant-render.art.vue',
);

/**
 * Art variant render query key
 */
export const ART_VARIANT_RENDER_QUERY_KEY = 'musea-art-variant-render';
