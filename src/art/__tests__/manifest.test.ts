import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, test, vi } from 'vite-plus/test';

import {
  createArtManifestCache,
  readArtManifestCache,
  scanArtManifest,
  upsertArtManifestCacheEntry,
  removeArtManifestCacheEntry,
} from '../manifest.ts';

function createFixtureRoot() {
  return mkdtempSync(path.join(tmpdir(), 'musea-manifest-'));
}

function writeFixture(root: string, file: string, content = '') {
  const target = path.join(root, file);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, content);
}

describe('scanArtManifest', () => {
  test('emits normalized root-relative manifest entries', () => {
    const root = createFixtureRoot();
    writeFixture(root, 'src/components/Button.vue');
    writeFixture(root, 'src/components/ButtonIcon.vue');
    writeFixture(
      root,
      'src/components/Button.test.ts',
      'import { test } from "vite-plus/test"; test("ok", () => {});',
    );
    writeFixture(root, 'src/docs/button.md', '# Button');
    writeFixture(
      root,
      'src/components/Button.art.vue',
      `
<template>
  <Art
    title="Button"
    description="Click it"
    :components='["./Button.vue","./ButtonIcon.vue"]'
    tests="./Button.test.ts"
    docs="../docs/button.md"
    category="Inputs"
    tags="form, action"
    status="ready"
  >
    <Variant name="primary" default />
    <Variant name="secondary" />
  </Art>
</template>
`,
    );

    expect(scanArtManifest({ root, patterns: ['**/*.art.vue'], ignore: [] })).toEqual([
      {
        title: 'Button',
        description: 'Click it',
        category: 'Inputs',
        status: 'ready',
        tags: ['form', 'action'],
        file: 'src/components/Button.art.vue',
        id: 'src/components/Button.art.vue',
        components: ['src/components/Button.vue', 'src/components/ButtonIcon.vue'],
        tests: ['src/components/Button.test.ts'],
        docsFile: 'src/docs/button.md',
        variants: [{ name: 'primary', default: true }, { name: 'secondary' }],
      },
    ]);
  });

  test('sorts entries and ignores missing components', () => {
    const root = createFixtureRoot();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    writeFixture(root, 'a.vue');
    writeFixture(
      root,
      'z.art.vue',
      '<template><Art title="Z" components="./Missing.vue" category="Demo" status="ready"><Variant name="z" /></Art></template>',
    );
    writeFixture(
      root,
      'a.art.vue',
      '<template><Art title="A" components="./a.vue" category="Demo" status="wip"><Variant name="a" /></Art></template>',
    );

    const manifest = scanArtManifest({ root, patterns: ['**/*.art.vue'], ignore: [] });

    expect(manifest.map((entry) => entry.id)).toEqual(['a.art.vue', 'z.art.vue']);
    expect(manifest[0]!.components).toEqual(['a.vue']);
    expect(manifest[1]!.components).toEqual([]);
    expect(manifest[1]!.tests).toEqual([]);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Missing component file for z.art.vue: ./Missing.vue'),
    );
    warn.mockRestore();
  });

  test('warns and skips missing explicit docs file', () => {
    const root = createFixtureRoot();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    writeFixture(root, 'Button.vue');
    writeFixture(
      root,
      'button.art.vue',
      '<template><Art title="Button" components="./Button.vue" category="Demo" status="ready" docs="./missing.md" /></template>',
    );

    expect(scanArtManifest({ root, patterns: ['**/*.art.vue'], ignore: [] })).toEqual([
      {
        title: 'Button',
        category: 'Demo',
        status: 'ready',
        tags: [],
        file: 'button.art.vue',
        id: 'button.art.vue',
        components: ['Button.vue'],
        tests: [],
        variants: [],
      },
    ]);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  test('warns and skips invalid art files instead of throwing', () => {
    const root = createFixtureRoot();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    writeFixture(root, 'good.vue');
    writeFixture(
      root,
      'good.art.vue',
      '<template><Art title="Good" components="./good.vue" category="Demo" status="ready" /></template>',
    );
    writeFixture(root, 'broken.art.vue', '<script setup lang="ts">const x = 1</script>');

    expect(scanArtManifest({ root, patterns: ['**/*.art.vue'], ignore: [] })).toEqual([
      {
        title: 'Good',
        category: 'Demo',
        status: 'ready',
        tags: [],
        file: 'good.art.vue',
        id: 'good.art.vue',
        components: ['good.vue'],
        tests: [],
        variants: [],
      },
    ]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Missing template in'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('broken.art.vue'));
    warn.mockRestore();
  });

  test('ignores missing component files while keeping existing ones', () => {
    const root = createFixtureRoot();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    writeFixture(root, 'src/components/Button.vue');
    writeFixture(
      root,
      'src/components/Button.art.vue',
      '<template><Art title="Button" :components=\'["./Button.vue","./Missing.vue"]\' category="Demo" status="ready" /></template>',
    );

    expect(scanArtManifest({ root, patterns: ['**/*.art.vue'], ignore: [] })).toEqual([
      {
        title: 'Button',
        category: 'Demo',
        status: 'ready',
        tags: [],
        file: 'src/components/Button.art.vue',
        id: 'src/components/Button.art.vue',
        components: ['src/components/Button.vue'],
        tests: [],
        variants: [],
      },
    ]);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'Missing component file for src/components/Button.art.vue: ./Missing.vue',
      ),
    );
    warn.mockRestore();
  });

  test('updates cached entries incrementally without a full rescan', () => {
    const root = createFixtureRoot();
    writeFixture(root, 'src/components/Button.vue');
    writeFixture(
      root,
      'src/components/Button.art.vue',
      '<template><Art title="Button" components="./Button.vue" category="Demo" status="ready" /></template>',
    );

    const cache = createArtManifestCache({
      root,
      patterns: ['**/*.art.vue'],
      ignore: [],
    });

    writeFixture(root, 'src/components/Card.vue');
    writeFixture(
      root,
      'src/components/Card.art.vue',
      '<template><Art title="Card" components="./Card.vue" category="Demo" status="wip" /></template>',
    );

    upsertArtManifestCacheEntry({
      cache,
      file: path.join(root, 'src/components/Card.art.vue'),
      root,
    });

    expect(readArtManifestCache(cache).map((entry) => entry.id)).toEqual([
      'src/components/Button.art.vue',
      'src/components/Card.art.vue',
    ]);

    removeArtManifestCacheEntry({
      cache,
      file: path.join(root, 'src/components/Button.art.vue'),
      root,
    });

    expect(readArtManifestCache(cache).map((entry) => entry.id)).toEqual([
      'src/components/Card.art.vue',
    ]);
  });
});
