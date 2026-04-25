import path from 'node:path';

import Shiki from '@shikijs/markdown-exit';
import vuePlugin from '@vitejs/plugin-vue';
import { MarkdownExit } from 'markdown-exit';
import taskLists from 'markdown-it-task-lists';
import { createConfigLoader } from 'unconfig';
import { normalizePath } from 'unplugin-utils';
import markdownPlugin from 'unplugin-vue-markdown/vite';
import { type Plugin } from 'vite';
import inspector from 'vite-plugin-vue-inspector';

import { findMuseaConfigFiles, loadMuseaConfig } from '../cli/config.ts';
import {
  VIRTUAL_ART,
  VIRTUAL_ART_MANIFEST,
  VIRTUAL_DOCS,
  VIRTUAL_MUSEA_CONFIG,
} from '../shared/constants.ts';
import type { MuseaConfig, MuseaPluginContext } from '../types/index.ts';
import { rebuildArtManifest } from './engine/manifest/index.ts';
import { createDocsChecker } from './engine/resolve-component-doc.ts';
import { attachMuseaHmr, handleMuseaDocsHotUpdate } from './hmr/index.ts';
import { invalidateVirtualModules } from './hmr/utils.ts';
import { museaServer } from './server.ts';
import { virtualFileRegistry } from './virtual-files/index.ts';
import { VIRTUAL_SETUP_ID } from './virtual-files/setup/index.ts';

const museaSetupFiles = 'musea.setup';

async function findMuseaSetupFile(cwd: string) {
  const loader = createConfigLoader({
    cwd,
    sources: {
      files: museaSetupFiles,
    },
  });

  const [setupFile] = await loader.findConfigs();
  return setupFile;
}

function isMuseaConfigFile(file: string) {
  const basename = path.basename(file);
  return basename.startsWith('musea.config.') || basename.startsWith('vite.config.');
}

function collectVirtualModulesByPrefix(context: MuseaPluginContext, resolvedId: string) {
  const server = context.devServer;
  if (!server) return [];

  return Array.from(server.moduleGraph.idToModuleMap.keys()).filter(
    (id) => id === resolvedId || id.startsWith(`${resolvedId}?`),
  );
}

async function syncMuseaConfigContext(context: MuseaPluginContext) {
  const nextOptions = await loadMuseaConfig({}, context.root);
  context.options = nextOptions;
  context.setupFile = await findMuseaSetupFile(context.root);
  context.componentMetaResolver = createDocsChecker({
    root: context.root,
    tsconfig: context.options.tsconfig,
  });
  rebuildArtManifest(context);
}

async function attachMuseaConfigHmr(context: MuseaPluginContext) {
  const server = context.devServer;
  if (!server) return;

  const configGlobs = [
    normalizePath(path.join(context.root, 'musea.config.*')),
    normalizePath(path.join(context.root, 'vite.config.*')),
  ];

  server.watcher.add(configGlobs);
  server.watcher.add(await findMuseaConfigFiles(context.root));

  const reloadConfig = async (file: string) => {
    if (!isMuseaConfigFile(file)) return;

    try {
      await syncMuseaConfigContext(context);
      server.watcher.add(await findMuseaConfigFiles(context.root));

      const configModules = collectVirtualModulesByPrefix(context, VIRTUAL_MUSEA_CONFIG.resolvedId);
      const manifestModules = collectVirtualModulesByPrefix(
        context,
        VIRTUAL_ART_MANIFEST.resolvedId,
      );
      const artModules = collectVirtualModulesByPrefix(context, VIRTUAL_ART.resolvedId);
      const docsModules = collectVirtualModulesByPrefix(context, VIRTUAL_DOCS.resolvedId);
      const setupModules = collectVirtualModulesByPrefix(context, VIRTUAL_SETUP_ID);

      invalidateVirtualModules(server, [
        ...configModules,
        ...manifestModules,
        ...artModules,
        ...docsModules,
        ...setupModules,
      ]);

      server.config.logger.info(`Musea config changed: ${normalizePath(file)}`, {
        clear: false,
        timestamp: true,
      });
      server.ws.send({ type: 'full-reload' });
    } catch (error) {
      server.config.logger.error(
        `Failed to reload Musea config from ${normalizePath(file)}.\n${error instanceof Error ? (error.stack ?? error.message) : String(error)}`,
        {
          clear: false,
          timestamp: true,
        },
      );
    }
  };

  server.watcher.on('add', (file) => void reloadConfig(file));
  server.watcher.on('change', (file) => void reloadConfig(file));
  server.watcher.on('unlink', (file) => void reloadConfig(file));
}

function markdownTableWarp(options?: { wrapperClass?: string }) {
  const { wrapperClass = 'table-wrapper' } = options || {};

  return (md: MarkdownExit) => {
    const defaultTableOpen =
      md.renderer.rules.table_open ||
      function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
      };

    const defaultTableClose =
      md.renderer.rules.table_close ||
      function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
      };

    md.renderer.rules.table_open = function (tokens, idx, options, env, self) {
      return `<div class="${wrapperClass}">\n` + defaultTableOpen(tokens, idx, options, env, self);
    };

    md.renderer.rules.table_close = function (tokens, idx, options, env, self) {
      return defaultTableClose(tokens, idx, options, env, self) + '\n</div>';
    };
  };
}

const DEFAULT_OPTIONS: MuseaConfig = {
  patterns: ['**/*.art.vue'],
  ignore: ['**/node_modules/**', '**/dist/**'],
  sourceMap: true,
  tsconfig: 'tsconfig.app.json',
  outDir: '.musea',
  setupFile: 'musea.setup.ts',
  port: 3000,
  host: false,
  variantRenderMode: 'iframe',
  vite: {},
};

export default async function museaPlugin(options = DEFAULT_OPTIONS) {
  const context: MuseaPluginContext = {
    root: process.cwd(),
    artManifest: [],
    artManifestCache: new Map(),
    addWatchFile: undefined,
    componentMetaResolver: undefined,
    devServer: undefined,
    isBuild: false,
    options,
    setupFile: undefined,
  };

  rebuildArtManifest(context);

  context.componentMetaResolver = createDocsChecker({
    root: context.root,
    tsconfig: context.options.tsconfig,
  });

  const museaPlugin: Plugin = {
    name: 'vite:viyuni-musea',
    enforce: 'post',
    async configResolved(config) {
      context.root = config.root;
      context.isBuild = config.command === 'build';
      context.setupFile = await findMuseaSetupFile(config.root);
      rebuildArtManifest(context);
    },
    configureServer(server) {
      context.devServer = server;
      server.middlewares.use(museaServer(context));
      attachMuseaHmr(context);
      void attachMuseaConfigHmr(context);
    },
    handleHotUpdate(ctx) {
      return handleMuseaDocsHotUpdate(ctx, context);
    },
    resolveId(id) {
      return virtualFileRegistry.resolveId(id, context);
    },
    load(id) {
      const addWatchFile = this.addWatchFile.bind(this);
      return virtualFileRegistry.load(id, { ...context, addWatchFile });
    },
  };

  return [
    vuePlugin({
      include: [/\.vue$/, /\.md$/],
      template: {
        compilerOptions: {
          isCustomElement: (tag) => ['art', 'variant'].includes(tag),
        },
      },
    }),
    inspector({
      enabled: false,
      toggleButtonVisibility: 'never',
    }),
    markdownPlugin({
      headEnabled: false,
      include: /\.md$/,
      markdownOptions: {
        html: true,
        linkify: true,
        typographer: true,
      },
      wrapperClasses: 'md-body',
      async markdownItSetup(md) {
        md.use(taskLists);
        md.use(markdownTableWarp());
        md.use(
          Shiki({
            themes: {
              light: 'vitesse-light',
              dark: 'vitesse-dark',
            },
          }),
        );
      },
    }),

    museaPlugin,
  ];
}
