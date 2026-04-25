import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, test, vi } from 'vite-plus/test';

import type {
  ArtManifest,
  VirtualFileContext,
  VirtualFileResolveContext,
} from '../../../types/index.ts';
import { artVariantVirtualFile, loadArtModule } from '../variant/index.ts';

function createFixtureRoot() {
  return mkdtempSync(path.join(tmpdir(), 'musea-variant-vf-'));
}

function writeFixture(root: string, file: string, content = '') {
  const target = path.join(root, file);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, content);
}

function createContext(root: string, artManifest: ArtManifest[]) {
  return {
    requestId: 'virtual:musea-art-variant.art.vue?artId=src%2FButton.art.vue',
    resolvedId: '',
    searchParams: new URLSearchParams(),
    root,
    artManifest,
    isBuild: false,
    options: { sourceMap: true },
    setupFile: undefined,
    addWatchFile: vi.fn(),
  } satisfies VirtualFileContext;
}

describe('artVariantVirtualFile', () => {
  test('id returns undefined and warns when artId is missing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const ctx = createContext('/repo', []);
    const idResolver = artVariantVirtualFile.id;

    if (typeof idResolver !== 'function') {
      throw new Error('Expected variant virtual file id resolver to be a function');
    }

    const resolved = idResolver({
      ...ctx,
      requestId: 'virtual:musea-art-variant.art.vue',
      searchParams: new URLSearchParams(),
    } satisfies VirtualFileResolveContext);

    expect(resolved).toBeUndefined();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Missing "artId"'));
    warn.mockRestore();
  });

  test('matchLoad matches only requests with render query key', () => {
    expect(
      artVariantVirtualFile.matchLoad?.(
        '\0id?musea-art-variant=true&artId=a',
        new URLSearchParams('musea-art-variant=true&artId=a'),
      ),
    ).toBe('virtual:musea-art-variant.art.vue?musea-art-variant=true&artId=a');

    expect(
      artVariantVirtualFile.matchLoad?.('\0id?artId=a', new URLSearchParams('artId=a')),
    ).toBeNull();
  });

  test('id resolves to a variant-specific synthetic filename', () => {
    const root = createFixtureRoot();
    writeFixture(
      root,
      'src/Button.art.vue',
      '<template><Art title="x" status="ready" /></template>',
    );
    const artManifest: ArtManifest[] = [
      {
        id: 'src/Button.art.vue',
        file: 'src/Button.art.vue',
        title: 'Button',
        components: ['src/Button.vue'],
        tests: [],
        tags: [],
        status: 'ready',
      },
    ];
    const ctx = createContext(root, artManifest);
    const idResolver = artVariantVirtualFile.id;

    if (typeof idResolver !== 'function') {
      throw new Error('Expected variant virtual file id resolver to be a function');
    }

    const resolved = idResolver({
      ...ctx,
      searchParams: new URLSearchParams({
        artId: 'src/Button.art.vue',
        variant: 'primary',
      }),
    } satisfies VirtualFileResolveContext);

    expect(resolved).toContain('Button__');
    expect(resolved).toContain('.art.vue?');
    expect(resolved).toContain('variant=primary');
  });

  test('load watches art file and returns transformed code', async () => {
    const root = createFixtureRoot();
    writeFixture(
      root,
      'src/Button.art.vue',
      '<template><Art title="x" status="ready"><Variant name="a"><div>A</div></Variant></Art></template>',
    );
    const artManifest: ArtManifest[] = [
      {
        id: 'src/Button.art.vue',
        file: 'src/Button.art.vue',
        title: 'Button',
        components: ['src/Button.vue'],
        tests: [],
        tags: [],
        status: 'ready',
      },
    ];
    const ctx = createContext(root, artManifest);
    ctx.searchParams = new URLSearchParams({
      artId: 'src/Button.art.vue',
      variant: 'a',
      'musea-art-variant': 'true',
    });
    ctx.requestId = `virtual:musea-art-variant.art.vue?${ctx.searchParams.toString()}`;

    const result = await artVariantVirtualFile.load(ctx);

    expect(ctx.addWatchFile).toHaveBeenCalledWith(
      path.join(root, 'src/Button.art.vue').replaceAll('\\', '/'),
    );
    expect(result?.code).toContain('<div>A</div>');
  });
});

describe('loadArtModule', () => {
  test('returns null for non-art sfc files', () => {
    expect(loadArtModule({ file: '/tmp/Button.vue' })).toBeNull();
  });
});
