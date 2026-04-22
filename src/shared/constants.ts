declare const __IS_UNPACKED__: boolean;

/**
 * Is pack
 */
export const IS_UNPACKED = typeof __IS_UNPACKED__ !== 'undefined' ? __IS_UNPACKED__ : true;

/**
 * H3 routes
 */
export const ROUTES = {
  base: '/',
  frameVariant: '/frame/variant',
  frameComponent: '/frame/component',
  openInEditor: '/open-in-editor',
  testRun: '/tests/run',
  testApi: '/tests/api',
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
export const VIRTUAL_ART_MANIFEST = {
  id: 'virtual:musea-manifest',
  resolvedId: '\0virtual:musea-manifest',
  url: '/@id/__x00__virtual:musea-manifest',
} as const;

/**
 * Docs manifest virtual module
 */
export const VIRTUAL_DOCS = {
  id: 'virtual:musea-docs',
  resolvedId: '\0virtual:musea-docs',
  url: '/@id/__x00__virtual:musea-docs',
} as const;

/**
 * Art variant virtual module
 */
export const VIRTUAL_ART_VARIANT = {
  id: 'virtual:musea-art-variant.art.vue',
  resolvedId: '\0virtual:musea-art-variant.art.vue',
  url: '/@id/__x00__virtual:musea-art-variant.art.vue',
} as const;

/**
 * Art bundle virtual module
 */
export const VIRTUAL_ART = {
  id: 'virtual:musea-art',
  resolvedId: '\0virtual:musea-art',
  url: '/@id/__x00__virtual:musea-art',
} as const;

/**
 * Art variant query key
 */
export const ART_VARIANT_QUERY_KEY = 'musea-art-variant';
