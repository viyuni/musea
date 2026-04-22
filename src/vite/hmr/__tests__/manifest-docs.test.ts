import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, test, vi } from 'vite-plus/test';

import { MUSEA_HOT_EVENTS, VIRTUAL_ART_MANIFEST, VIRTUAL_DOCS } from '../../../shared/constants.ts';
import type { ArtManifest, MuseaPluginContext } from '../../../types/index.ts';
import { toManifestCacheKey } from '../../engine/manifest/files.ts';
import { handleMuseaDocsHotUpdate } from '../docs.ts';
import { refreshManifestHmr } from '../manifest.ts';

function createFixtureRoot() {
  return mkdtempSync(path.join(tmpdir(), 'musea-hmr-'));
}

function writeFixture(root: string, file: string, content = '') {
  const target = path.join(root, file);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, content);
}

function createDevServer(moduleIds: string[]) {
  const idToModuleMap = new Map(moduleIds.map((id) => [id, { id }]));
  const sent: any[] = [];
  const invalidated: string[] = [];
  const handlers = new Map<string, (file: string) => void>();

  return {
    sent,
    invalidated,
    server: {
      moduleGraph: {
        idToModuleMap,
        getModuleById(id: string) {
          return idToModuleMap.get(id);
        },
        invalidateModule(moduleNode: { id: string }) {
          invalidated.push(moduleNode.id);
        },
      },
      ws: {
        send(payload: unknown) {
          sent.push(payload);
        },
      },
      watcher: {
        on(event: string, handler: (file: string) => void) {
          handlers.set(event, handler);
        },
      },
    },
  };
}

function createContext(root: string, artManifest: ArtManifest[]) {
  const { server, sent, invalidated } = createDevServer([
    VIRTUAL_ART_MANIFEST.resolvedId,
    `${VIRTUAL_ART_MANIFEST.resolvedId}?t=1`,
    VIRTUAL_DOCS.resolvedId,
    `${VIRTUAL_DOCS.resolvedId}?artId=src%2FButton.art.vue`,
  ]);

  const context: MuseaPluginContext = {
    root,
    options: { patterns: ['**/*.art.vue'], ignore: [] },
    artManifest,
    artManifestCache: new Map(
      artManifest.map((item) => [toManifestCacheKey(path.join(root, item.file), root), item]),
    ),
    isBuild: false,
    devServer: server as never,
  };

  return { context, sent, invalidated };
}

describe('manifest hmr', () => {
  test('refreshManifestHmr on change notifies manifest + docs updates', async () => {
    const root = createFixtureRoot();
    writeFixture(root, 'src/Button.vue');
    writeFixture(root, 'src/Button.md', '# Button docs');
    writeFixture(
      root,
      'src/Button.art.vue',
      '<template><Art title="Button" components="./Button.vue" docs="./Button.md" status="ready" /></template>',
    );
    const { context, sent, invalidated } = createContext(root, []);

    await refreshManifestHmr(context, path.join(root, 'src/Button.art.vue'), 'change');

    expect(context.artManifest.map((item) => item.id)).toEqual(['src/Button.art.vue']);
    expect(sent).toHaveLength(2);
    expect(sent[0]).toMatchObject({ event: MUSEA_HOT_EVENTS.manifestUpdate });
    expect(sent[1]).toMatchObject({
      event: MUSEA_HOT_EVENTS.docsUpdate,
      data: { affectedArtIds: ['src/Button.art.vue'] },
    });
    expect(invalidated).toEqual(
      expect.arrayContaining([
        VIRTUAL_ART_MANIFEST.resolvedId,
        `${VIRTUAL_ART_MANIFEST.resolvedId}?t=1`,
        VIRTUAL_DOCS.resolvedId,
        `${VIRTUAL_DOCS.resolvedId}?artId=src%2FButton.art.vue`,
      ]),
    );
  });

  test('refreshManifestHmr on unlink only notifies manifest update', async () => {
    const root = createFixtureRoot();
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
    const { context, sent } = createContext(root, artManifest);

    await refreshManifestHmr(context, path.join(root, 'src/Button.art.vue'), 'unlink');

    expect(context.artManifest).toEqual([]);
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({ event: MUSEA_HOT_EVENTS.manifestUpdate });
  });
});

describe('docs hmr', () => {
  test('handleMuseaDocsHotUpdate updates meta resolver and emits docs event for affected art', async () => {
    const root = createFixtureRoot();
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
    const { context, sent, invalidated } = createContext(root, artManifest);
    const updateFile = vi.fn();
    const clearCache = vi.fn();
    context.componentMetaResolver = { updateFile, clearCache } as never;

    const modules = [
      {
        file: path.join(root, 'src/Button.vue'),
        id: '/src/Button.vue',
        url: '/src/Button.vue',
        importers: new Set(),
        acceptedHmrDeps: new Set(),
      },
    ];
    const hmrContext = {
      file: path.join(root, 'src/Button.vue'),
      modules,
      read: async () => 'export default {}',
    };

    const result = await handleMuseaDocsHotUpdate(hmrContext as never, context);

    expect(result).toBe(modules);
    expect(updateFile).toHaveBeenCalledWith(path.join(root, 'src/Button.vue'), 'export default {}');
    expect(clearCache).toHaveBeenCalled();
    expect(sent[sent.length - 1]).toMatchObject({
      event: MUSEA_HOT_EVENTS.docsUpdate,
      data: { affectedArtIds: ['src/Button.art.vue'] },
    });
    expect(invalidated).toContain(VIRTUAL_DOCS.resolvedId);
  });

  test('handleMuseaDocsHotUpdate returns early when no art is affected', async () => {
    const root = createFixtureRoot();
    const { context, sent } = createContext(root, []);
    const modules = [
      {
        file: path.join(root, 'src/Other.vue'),
        id: '/src/Other.vue',
        url: '/src/Other.vue',
        importers: new Set(),
        acceptedHmrDeps: new Set(),
      },
    ];

    const result = await handleMuseaDocsHotUpdate(
      {
        file: path.join(root, 'src/Other.vue'),
        modules,
        read: async () => 'export default {}',
      } as never,
      context,
    );

    expect(result).toBe(modules);
    expect(sent).toEqual([]);
  });
});
