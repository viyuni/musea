import Shiki from '@shikijs/markdown-exit';
import vuePlugin from '@vitejs/plugin-vue';
import taskLists from 'markdown-it-task-lists';
import { createConfigLoader } from 'unconfig';
import markdownPlugin from 'unplugin-vue-markdown/vite';
import { type Plugin } from 'vite';
import inspector from 'vite-plugin-vue-inspector';

import { rebuildArtManifest } from '../art/manifest.ts';
import { createDocsChecker } from '../art/resolve-component-doc.ts';
import { attachMuseaHmr, handleMuseaDocsHotUpdate } from '../hmr/index.ts';
import type { MuseaConfig, MuseaPluginContext } from '../types/index.ts';
import { createVirtualFileRegistry } from '../virtual-files/core/index.ts';
import { artDocsVirtualFile } from '../virtual-files/docs/index.ts';
import { artManifestVirtualFile } from '../virtual-files/manifest/index.ts';
import { artVariantRenderVirtualFile } from '../virtual-files/render/index.ts';
import { setupVirtualFile } from '../virtual-files/setup/index.ts';
import { styleVirtualFile } from '../virtual-files/style/index.ts';
import { museaServer } from './server.ts';

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

const DEFAULT_OPTIONS: MuseaConfig = {
  patterns: ['**/*.art.vue'],
  ignore: ['**/node_modules/**', '**/dist/**'],
  sourceMap: true,
  tsconfig: 'tsconfig.app.json',
  outDir: '.musea',
  setupFile: 'musea.setup.ts',
  port: 3000,
  host: false,
  vite: {},
};

const virtualFileRegistry = createVirtualFileRegistry([
  artManifestVirtualFile,
  artDocsVirtualFile,
  styleVirtualFile,
  artVariantRenderVirtualFile,
  setupVirtualFile,
]);

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
