import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, test, vi } from 'vite-plus/test';

import type { MuseaPluginContext } from '../../../types/index.ts';
import {
  createArtManifestCache,
  readArtManifestCache,
  refreshArtManifest,
} from '../manifest/index.ts';
import { resolveArtDocsTarget, toArtManifestEntry } from '../manifest/metadata.ts';

function createFixtureRoot() {
  return mkdtempSync(path.join(tmpdir(), 'musea-manifest-runtime-'));
}

function writeFixture(root: string, file: string, content = '') {
  const target = path.join(root, file);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, content);
}

function createContext(root: string): MuseaPluginContext {
  const options = {
    patterns: ['**/*.art.vue'],
    ignore: [],
  };
  const artManifestCache = createArtManifestCache({
    root,
    patterns: options.patterns,
    ignore: options.ignore,
  });

  return {
    root,
    options,
    artManifestCache,
    artManifest: readArtManifestCache(artManifestCache),
    isBuild: false,
  };
}

describe('manifest metadata', () => {
  test('resolveArtDocsTarget prefers explicit docs path', () => {
    const root = createFixtureRoot();
    writeFixture(
      root,
      'src/button.art.vue',
      '<template><Art title="Button" components="./Button.vue" status="ready" docs="../docs/button.md" /></template>',
    );

    expect(resolveArtDocsTarget(path.join(root, 'src/button.art.vue'), root)).toBe(
      'docs/button.md',
    );
  });

  test('toArtManifestEntry keeps existing tests and warns for missing tests', () => {
    const root = createFixtureRoot();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    writeFixture(root, 'src/Button.vue');
    writeFixture(root, 'src/Button.test.ts', 'export {};');
    writeFixture(
      root,
      'src/Button.art.vue',
      `<template>
  <Art
    title="Button"
    :components='["./Button.vue"]'
    :tests='["./Button.test.ts","./Button.a11y.test.ts"]'
    status="ready"
  />
</template>`,
    );

    expect(toArtManifestEntry(path.join(root, 'src/Button.art.vue'), root)).toMatchObject({
      id: 'src/Button.art.vue',
      tests: ['src/Button.test.ts'],
    });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Missing test file for src/Button.art.vue: ./Button.a11y.test.ts'),
    );
    warn.mockRestore();
  });
});

describe('refreshArtManifest', () => {
  test('falls back to full rebuild when file is missing', () => {
    const root = createFixtureRoot();
    const context = createContext(root);
    writeFixture(root, 'src/Button.vue');
    writeFixture(
      root,
      'src/Button.art.vue',
      '<template><Art title="Button" components="./Button.vue" status="ready" /></template>',
    );

    refreshArtManifest(context);

    expect(context.artManifest.map((entry) => entry.id)).toEqual(['src/Button.art.vue']);
  });

  test('handles add/change and unlink incrementally', () => {
    const root = createFixtureRoot();
    writeFixture(root, 'src/Button.vue');
    writeFixture(
      root,
      'src/Button.art.vue',
      '<template><Art title="Button" components="./Button.vue" status="ready" /></template>',
    );
    const context = createContext(root);

    writeFixture(root, 'src/Card.vue');
    writeFixture(
      root,
      'src/Card.art.vue',
      '<template><Art title="Card" components="./Card.vue" status="wip" /></template>',
    );

    refreshArtManifest(context, path.join(root, 'src/Card.art.vue'), 'add');
    expect(context.artManifest.map((entry) => entry.id)).toEqual([
      'src/Button.art.vue',
      'src/Card.art.vue',
    ]);

    writeFixture(
      root,
      'src/Card.art.vue',
      '<template><Art title="Card 2" components="./Card.vue" status="deprecated" /></template>',
    );
    refreshArtManifest(context, path.join(root, 'src/Card.art.vue'), 'change');
    expect(context.artManifest.find((entry) => entry.id === 'src/Card.art.vue')?.title).toBe(
      'Card 2',
    );

    refreshArtManifest(context, path.join(root, 'src/Button.art.vue'), 'unlink');
    expect(context.artManifest.map((entry) => entry.id)).toEqual(['src/Card.art.vue']);
  });
});
