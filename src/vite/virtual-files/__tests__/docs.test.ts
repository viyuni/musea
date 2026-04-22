import { describe, expect, test, vi } from 'vite-plus/test';

import type { ArtManifest, VirtualFileContext } from '../../../types/index.ts';
import { artDocsVirtualFile, resolveArtDocs } from '../docs/index.ts';

function createContext(overrides?: {
  artManifest?: ArtManifest[];
  resolver?: { resolveComponentMeta: (file: string) => unknown };
  warn?: (message: string) => void;
}): VirtualFileContext {
  return {
    requestId: 'virtual:musea-docs',
    resolvedId: '\0virtual:musea-docs',
    searchParams: new URLSearchParams(),
    root: '/repo',
    artManifest: overrides?.artManifest ?? [],
    componentMetaResolver: overrides?.resolver as VirtualFileContext['componentMetaResolver'],
    devServer: overrides?.warn
      ? ({ config: { logger: { warn: overrides.warn } } } as VirtualFileContext['devServer'])
      : undefined,
    isBuild: false,
    options: {},
    setupFile: undefined,
  };
}

describe('artDocsVirtualFile', () => {
  test('resolveArtDocs throws when resolver is missing', () => {
    const ctx = createContext();

    expect(() => resolveArtDocs('missing', ctx)).toThrowError('Resolver is not ready');
  });

  test('resolveArtDocs returns empty array and warns for unknown art id', () => {
    const warn = vi.fn();
    const ctx = createContext({
      artManifest: [],
      resolver: { resolveComponentMeta: vi.fn() },
      warn,
    });

    expect(resolveArtDocs('unknown-art', ctx)).toEqual([]);
    expect(warn).toHaveBeenCalledWith('Unknown art id: unknown-art');
  });

  test('load with artId returns docs export from resolver', async () => {
    const resolveComponentMeta = vi.fn((file: string) => ({ file, name: 'Demo' }));
    const artManifest: ArtManifest[] = [
      {
        id: 'src/Button.art.vue',
        file: 'src/Button.art.vue',
        title: 'Button',
        components: ['src/Button.vue', 'src/Icon.vue'],
        tests: [],
        tags: [],
        status: 'ready',
      },
    ];
    const ctx = createContext({
      artManifest,
      resolver: { resolveComponentMeta },
    });
    ctx.searchParams = new URLSearchParams({ artId: 'src/Button.art.vue' });

    const code = await artDocsVirtualFile.load(ctx);

    expect(resolveComponentMeta).toHaveBeenCalledTimes(2);
    expect(code).toContain('export const docs =');
    expect(code).toContain('"file": "src/Button.vue"');
    expect(code).toContain('"file": "src/Icon.vue"');
  });

  test('load without artId returns docs modules and markdown modules', async () => {
    const artManifest: ArtManifest[] = [
      {
        id: 'src/Button.art.vue',
        file: 'src/Button.art.vue',
        title: 'Button',
        components: ['src/Button.vue'],
        tests: [],
        tags: [],
        status: 'ready',
        docsFile: 'src/Button.md',
      },
      {
        id: 'src/Card.art.vue',
        file: 'src/Card.art.vue',
        title: 'Card',
        components: ['src/Card.vue'],
        tests: [],
        tags: [],
        status: 'ready',
      },
    ];
    const ctx = createContext({
      artManifest,
      resolver: { resolveComponentMeta: vi.fn() },
    });

    const code = await artDocsVirtualFile.load(ctx);

    expect(code).toContain('export const docsModules =');
    expect(code).toContain(
      '"src/Button.art.vue": () => import("virtual:musea-docs?artId=src%2FButton.art.vue")',
    );
    expect(code).toContain('export const markdownDocsModules =');
    expect(code).toContain('"src/Button.art.vue": () => import(');
    expect(code).toContain('Button.md');
    expect(code).not.toContain('Card.md');
  });
});
