import { describe, expect, test } from 'vite-plus/test';

import {
  createConstExport,
  createDefaultExport,
  createImport,
  createVirtualFileRegistry,
  renderObjectLiteral,
  serializeModuleValue,
} from '../index.ts';

const registryContext = {
  root: '/',
  artManifest: [],
  checker: undefined,
  devServer: undefined,
  isBuild: false,
  options: {
    patterns: [],
    ignore: [],
    sourceMap: true,
    tsconfig: 'tsconfig.json',
    outDir: '.musea',
    setupFile: 'musea.setup.ts',
    port: 3000,
    host: false,
    vite: {},
  },
  setupFile: undefined,
};

describe('virtual file helpers', () => {
  test('renders module snippets', () => {
    const params = new URLSearchParams({ variant: 'primary' });

    expect(createImport('/src/Button.vue', params)).toBe(
      '() => import("/src/Button.vue?variant=primary")',
    );
    expect(serializeModuleValue({ title: 'Button' })).toBe('{\n  "title": "Button"\n}');
    expect(createConstExport('manifest', '[]')).toBe('export const manifest = [];');
    expect(createDefaultExport('{}')).toBe('export default {};');
    expect(renderObjectLiteral(['one: 1', 'two: 2'])).toBe('{\none: 1,\ntwo: 2\n}');
    expect(renderObjectLiteral([])).toBe('{}');
  });
});

describe('createVirtualFileRegistry', () => {
  test('resolves and loads string virtual files with query parameters', async () => {
    const registry = createVirtualFileRegistry([
      {
        id: 'virtual:musea-test',
        load: (ctx) => ({
          requestId: ctx.requestId,
          resolvedId: ctx.resolvedId,
          variant: ctx.searchParams.get('variant'),
        }),
      },
    ]);

    expect(registry.resolveId('virtual:musea-test?variant=primary', registryContext)).toBe(
      '\0virtual:musea-test?variant=primary',
    );
    await expect(
      registry.load('\0virtual:musea-test?variant=primary', registryContext),
    ).resolves.toEqual({
      requestId: 'virtual:musea-test?variant=primary',
      resolvedId: '\0virtual:musea-test?variant=primary',
      variant: 'primary',
    });
  });

  test('supports custom resolvers and matchLoad hooks', async () => {
    const registry = createVirtualFileRegistry([
      {
        id: ({ requestId, searchParams }) =>
          requestId === 'virtual:dynamic'
            ? `\0virtual:dynamic?name=${searchParams.get('name') ?? 'default'}`
            : undefined,
        matchLoad: (id) => (id.startsWith('\0virtual:dynamic?') ? id.slice(1) : null),
        load: (ctx) => ctx.searchParams.get('name'),
      },
    ]);

    expect(registry.resolveId('virtual:dynamic', registryContext)).toBe(
      '\0virtual:dynamic?name=default',
    );
    await expect(registry.load('\0virtual:dynamic?name=docs', registryContext)).resolves.toBe(
      'docs',
    );
  });
});
