import { describe, expect, test } from 'vite-plus/test';

import type { ArtManifest } from '../../../types/index.ts';
import { artBundleVirtualFile } from '../art/index.ts';

function createContext(artManifest: ArtManifest[], searchParams?: URLSearchParams) {
  return {
    requestId: `virtual:musea-art${searchParams?.size ? `?${searchParams.toString()}` : ''}`,
    resolvedId: '\0virtual:musea-art',
    searchParams: searchParams ?? new URLSearchParams(),
    root: '/repo',
    artManifest,
    isBuild: false,
    options: {},
    setupFile: undefined,
  } as never;
}

describe('artBundleVirtualFile', () => {
  test('exports bundled component and variants for an art id', async () => {
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
    const ctx = createContext(artManifest, new URLSearchParams({ artId: 'src/Button.art.vue' }));

    const code = await artBundleVirtualFile.load(ctx);

    expect(code).toContain('import component_0 from "/@fs/C:/repo/src/Button.vue";');
    expect(code).toContain(
      'import variant_0 from "virtual:musea-art-variant.art.vue?artId=src%2FButton.art.vue";',
    );
    expect(code).toContain(
      'import variant_1 from "virtual:musea-art-variant.art.vue?artId=src%2FButton.art.vue&variant=primary";',
    );
    expect(code).toContain('export default {');
    expect(code).toContain('"src/Button.art.vue": {');
    expect(code).toContain('"": variant_0');
    expect(code).toContain('"primary": variant_1');
  });

  test('throws in virtual module when primary component is missing', async () => {
    const artManifest: ArtManifest[] = [
      {
        id: 'src/NoComp.art.vue',
        file: 'src/NoComp.art.vue',
        title: 'NoComp',
        components: [],
        tests: [],
        tags: [],
        status: 'ready',
      },
    ];
    const ctx = createContext(artManifest, new URLSearchParams({ artId: 'src/NoComp.art.vue' }));

    const code = await artBundleVirtualFile.load(ctx);

    expect(code).toContain('Missing primary component for art id: src/NoComp.art.vue');
  });
});
