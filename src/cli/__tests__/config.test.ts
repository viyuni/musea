import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, test } from 'vite-plus/test';

import { DEFAULT_OUT_DIR, DEFAULT_SETUP_FILE, loadMuseaConfig } from '../config.ts';

function createConfigRoot() {
  return mkdtempSync(path.join(tmpdir(), 'musea-config-'));
}

describe('loadMuseaConfig', () => {
  test('fills defaults when no config file exists', async () => {
    await expect(loadMuseaConfig({}, createConfigRoot())).resolves.toMatchObject({
      patterns: ['**/*.art.vue'],
      ignore: ['**/node_modules/**', '**/dist/**'],
      sourceMap: true,
      tsconfig: 'tsconfig.json',
      outDir: DEFAULT_OUT_DIR,
      setupFile: DEFAULT_SETUP_FILE,
      port: 3000,
      host: false,
      vite: {},
    });
  });

  test('loads musea.config and keeps config values when overrides are undefined', async () => {
    const root = createConfigRoot();
    writeFileSync(
      path.join(root, 'musea.config.mjs'),
      `
export default {
  patterns: ['stories/**/*.art.vue'],
  ignore: ['**/.cache/**'],
  sourceMap: false,
  outDir: '${root.replaceAll('\\', '/')}/custom-musea',
  setupFile: 'setup/musea.ts',
  port: 4123,
  host: '127.0.0.1',
  vite: { base: '/docs/' },
}
`,
    );

    await expect(
      loadMuseaConfig({ port: undefined, host: undefined, outDir: undefined }, root),
    ).resolves.toMatchObject({
      patterns: ['stories/**/*.art.vue'],
      ignore: ['**/.cache/**'],
      sourceMap: false,
      outDir: path.relative(process.cwd(), path.join(root, 'custom-musea')).replaceAll('\\', '/'),
      setupFile: 'setup/musea.ts',
      port: 4123,
      host: '127.0.0.1',
      vite: { base: '/docs/' },
    });
  });

  test('lets explicit CLI overrides win', async () => {
    const root = createConfigRoot();
    writeFileSync(
      path.join(root, 'musea.config.mjs'),
      'export default { port: 3001, host: false }',
    );

    await expect(loadMuseaConfig({ port: 5173, host: true }, root)).resolves.toMatchObject({
      port: 5173,
      host: true,
    });
  });
});
