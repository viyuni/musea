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
  test('exports manifest and art module loaders', async () => {
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
    expect(code).toContain('export const artModules =');
    expect(code).toContain(
      '"src/Button.art.vue": () => import("virtual:musea-art?artId=src%2FButton.art.vue")',
    );
  });

  test('still exports loader when art has no primary component', async () => {
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

    expect(code).toContain('export const artModules =');
    expect(code).toContain(
      '"src/NoComp.art.vue": () => import("virtual:musea-art?artId=src%2FNoComp.art.vue")',
    );
  });
});
