import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, test } from 'vite-plus/test';

import { findArtFiles, toManifestCacheKey } from '../manifest/files.ts';
import {
  createArtManifestCache,
  readArtManifestCache,
  upsertArtManifestCacheEntry,
} from '../manifest/index.ts';

function createFixtureRoot() {
  return mkdtempSync(path.join(tmpdir(), 'musea-manifest-files-'));
}

function writeFixture(root: string, file: string, content = '') {
  const target = path.join(root, file);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, content);
}

describe('manifest files', () => {
  test('findArtFiles respects root and ignore patterns', () => {
    const root = createFixtureRoot();
    writeFixture(
      root,
      'src/keep.art.vue',
      '<template><Art title="Keep" status="ready" /></template>',
    );
    writeFixture(
      root,
      'src/skip/skip.art.vue',
      '<template><Art title="Skip" status="ready" /></template>',
    );
    writeFixture(root, 'src/not-art.vue', '<template><div /></template>');

    const files = findArtFiles(['**/*.art.vue'], ['**/skip/**'], root).map((file) =>
      path.posix.normalize(path.relative(root, file).replaceAll('\\', '/')),
    );

    expect(files).toEqual(['src/keep.art.vue']);
  });

  test('toManifestCacheKey always returns root-relative normalized slashes', () => {
    const root = 'C:\\repo\\demo';
    const file = 'C:\\repo\\demo\\src\\nested\\Button.art.vue';

    expect(toManifestCacheKey(file, root)).toBe('src/nested/Button.art.vue');
  });
});

describe('manifest cache', () => {
  test('readArtManifestCache is sorted by id', () => {
    const root = createFixtureRoot();
    writeFixture(root, 'src/A.vue');
    writeFixture(root, 'src/Z.vue');
    writeFixture(
      root,
      'src/z.art.vue',
      '<template><Art title="Z" components="./Z.vue" status="ready" /></template>',
    );
    writeFixture(
      root,
      'src/a.art.vue',
      '<template><Art title="A" components="./A.vue" status="ready" /></template>',
    );

    const cache = createArtManifestCache({
      root,
      patterns: ['**/*.art.vue'],
      ignore: [],
    });

    expect(readArtManifestCache(cache).map((item) => item.id)).toEqual([
      'src/a.art.vue',
      'src/z.art.vue',
    ]);
  });

  test('upsertArtManifestCacheEntry removes cache entry when file becomes invalid', () => {
    const root = createFixtureRoot();
    writeFixture(root, 'src/Button.vue');
    writeFixture(
      root,
      'src/Button.art.vue',
      '<template><Art title="Button" components="./Button.vue" status="ready" /></template>',
    );
    const cache = createArtManifestCache({
      root,
      patterns: ['**/*.art.vue'],
      ignore: [],
    });
    expect(readArtManifestCache(cache).map((item) => item.id)).toEqual(['src/Button.art.vue']);

    writeFixture(root, 'src/Button.art.vue', '<script setup lang="ts">const broken = 1</script>');
    const upserted = upsertArtManifestCacheEntry({
      cache,
      file: path.join(root, 'src/Button.art.vue'),
      root,
    });

    expect(upserted).toBeUndefined();
    expect(readArtManifestCache(cache)).toEqual([]);
  });
});
