import { describe, expect, test } from 'vite-plus/test';

import type { ArtManifest } from '../../../types/index.ts';
import { artManifestVirtualFile } from '../manifest/index.ts';

function createContext(artManifest: ArtManifest[]) {
  return {
    requestId: 'virtual:musea-manifest',
    resolvedId: '\0virtual:musea-manifest',
    searchParams: new URLSearchParams(),
    root: '/repo',
    artManifest,
    isBuild: false,
    options: {},
    setupFile: undefined,
  } as never;
}

describe('artManifestVirtualFile', () => {
  test('exports manifest and variant loaders including default variant key', async () => {
    const artManifest: ArtManifest[] = [
      {
        id: 'src/Button.art.vue',
        file: 'src/Button.art.vue',
        title: 'Button',
        components: ['src/Button.vue'],
        tests: [],
        tags: [],
        status: 'ready',
        variants: [{ name: 'primary' }],
      },
    ];

    const code = await artManifestVirtualFile.load(createContext(artManifest));

    expect(code).toContain('export const manifest =');
    expect(code).toContain('export const artVariantModules =');
    expect(code).toContain(
      '"": () => import("virtual:musea-art-variant-render.art.vue?artId=src%2FButton.art.vue")',
    );
    expect(code).toContain(
      '"primary": () => import("virtual:musea-art-variant-render.art.vue?artId=src%2FButton.art.vue&variant=primary")',
    );
  });

  test('exports reject loader when art has no primary component', async () => {
    const artManifest: ArtManifest[] = [
      {
        id: 'src/NoComp.art.vue',
        file: 'src/NoComp.art.vue',
        title: 'NoComp',
        components: [],
        tests: [],
        tags: [],
        status: 'wip',
      },
    ];

    const code = await artManifestVirtualFile.load(createContext(artManifest));

    expect(code).toContain('export const componentModules =');
    expect(code).toContain('Missing primary component for art id: src/NoComp.art.vue');
  });
});
