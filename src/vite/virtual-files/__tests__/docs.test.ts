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

  test('load without artId returns dynamic docs manifest', async () => {
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
    expect(code).not.toContain('Button.md');
    expect(code).not.toContain('meta:');
  });

  test('load with artId returns static docs and markdown entry', async () => {
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
        docsFile: 'src/Button.md',
      },
    ];
    const ctx = createContext({
      artManifest,
      resolver: { resolveComponentMeta },
    });
    ctx.searchParams = new URLSearchParams({ artId: 'src/Button.art.vue' });

    const code = await artDocsVirtualFile.load(ctx);

    expect(resolveComponentMeta).toHaveBeenCalledTimes(2);
    expect(code).toContain('import markdown from "/src/Button.md";');
    expect(code).toContain('export * from "/src/Button.vue";');
    expect(code).toContain('export * from "/src/Icon.vue";');
    expect(code).toContain('export const docs =');
    expect(code).toContain('meta: [');
    expect(code).toContain('"file": "src/Button.vue"');
    expect(code).toContain('markdown: markdown');
    expect(code).toContain('Button.md');
  });
});
