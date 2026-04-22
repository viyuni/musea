import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { normalizePath } from 'unplugin-utils';
import { build, mergeConfig, type InlineConfig } from 'vite';

import { renderHtml, toAbsolutePath } from '../shared/utils.ts';
import { PATHS } from '../vite/config.ts';
import musea from '../vite/index.ts';
import { loadMuseaConfig, type ResolvedMuseaConfig } from './config.ts';

type BuildResult = Awaited<ReturnType<typeof build>>;
type BuildOutput = Extract<BuildResult, { output: unknown[] }>;
type BundleItem = BuildOutput['output'][number];
type OutputChunk = Extract<BundleItem, { type: 'chunk' }>;
type OutputAsset = Extract<BundleItem, { type: 'asset' }>;
type BuildBundle = Array<OutputChunk | OutputAsset>;

type MuseaEntryChunk = OutputChunk & {
  viteMetadata?: {
    importedCss?: Set<string>;
  };
};

type BuildArtifacts = {
  bundle: BuildBundle;
  entryChunks: Map<string, MuseaEntryChunk & { isEntry: true }>;
};

export type MuseaCliContext = {
  cwd: string;
  museaConfig: ResolvedMuseaConfig;
};

type MuseaPage = {
  file: string;
  title: string;
  chunk: BuildArtifacts['entryChunks'] extends Map<string, infer T> ? T : never;
};

function resolveViteFilePath(file: string, cwd: string) {
  if (file.startsWith('/@fs/')) {
    return file.slice('/@fs/'.length);
  }

  if (file.startsWith('/')) {
    return path.join(cwd, file.slice(1));
  }

  if (file.startsWith('./') || file.startsWith('../')) {
    return path.resolve(cwd, file);
  }

  throw new Error(`Unsupported Vite file path: ${file}`);
}

function isBuildOutput(result: BuildResult): result is BuildOutput {
  return 'output' in result;
}

function getEntryCssFiles(entryChunk: MuseaEntryChunk | undefined) {
  return [...(entryChunk?.viteMetadata?.importedCss ?? [])];
}

function toHtmlAssetPath(htmlFile: string, assetFile: string) {
  const relative = normalizePath(path.relative(path.dirname(htmlFile), assetFile));
  return relative.startsWith('.') ? relative : `./${relative}`;
}

async function writeOutputFile(outDir: string, item: OutputChunk | OutputAsset) {
  const filePath = path.join(outDir, item.fileName);
  await mkdir(path.dirname(filePath), { recursive: true });

  if (item.type === 'asset') {
    await writeFile(filePath, item.source ?? '');
    return;
  }

  await writeFile(filePath, item.code);
}

async function writeBundleFiles(outDir: string, build: BuildArtifacts) {
  await Promise.all(build.bundle.map((item) => writeOutputFile(outDir, item)));
}

async function buildMuseaBundle(config: InlineConfig): Promise<BuildArtifacts> {
  const result = await build(config);
  const outputs = Array.isArray(result) ? result : [result];
  const bundle = outputs.filter(isBuildOutput).flatMap((item) => item.output);

  const entryChunks = new Map(
    bundle
      .filter((item): item is MuseaEntryChunk & { isEntry: true } => {
        return item.type === 'chunk' && item.isEntry;
      })
      .map((item) => [item.name, item] as const),
  );

  return {
    bundle,
    entryChunks,
  };
}

function getRequiredEntryChunk(build: BuildArtifacts, name: string) {
  const chunk = build.entryChunks.get(name);

  if (!chunk) {
    throw new Error(`Musea static build did not emit the "${name}" entry chunk.`);
  }

  return chunk;
}

async function writeMuseaPage(absoluteOutDir: string, page: MuseaPage) {
  const entryFile = toHtmlAssetPath(page.file, path.join(absoluteOutDir, page.chunk.fileName));
  const cssFiles = getEntryCssFiles(page.chunk).map((file) =>
    toHtmlAssetPath(page.file, path.join(absoluteOutDir, file)),
  );

  await mkdir(path.dirname(page.file), { recursive: true });
  await writeFile(
    page.file,
    renderHtml({
      title: page.title,
      entryFile,
      cssFiles,
    }),
  );
}

function mergeFullConfig(museaConfig: ResolvedMuseaConfig, cwd = process.cwd()): InlineConfig {
  return mergeConfig(museaConfig.vite, {
    configFile: false,
    root: process.cwd(),
    publicDir: false,
    define: {
      __IS_UNPACKED__: 'false',
    },
    plugins: [musea(museaConfig)],
    build: {
      copyPublicDir: false,
      cssMinify: false,
      emptyOutDir: false,
      outDir: museaConfig.outDir,
      write: false,
      rollupOptions: {
        input: {
          app: resolveViteFilePath(PATHS.appEntry, cwd),
          'client-frame-variant': resolveViteFilePath(PATHS.variantFrameEntry, cwd),
          'client-frame-component': resolveViteFilePath(PATHS.componentFrameEntry, cwd),
        },
        output: {
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name].js',
        },
      },
    },
  } satisfies InlineConfig);
}

async function writeMuseaPages(absoluteOutDir: string, build: BuildArtifacts) {
  const pages = [
    {
      file: path.join(absoluteOutDir, 'index.html'),
      title: 'Musea',
      chunk: getRequiredEntryChunk(build, 'app'),
      inlineCss: '',
    },
    {
      file: path.join(absoluteOutDir, 'frame', 'variant', 'index.html'),
      title: 'Musea Art Preview',
      chunk: getRequiredEntryChunk(build, 'client-frame-variant'),
    },
    {
      file: path.join(absoluteOutDir, 'frame', 'component', 'index.html'),
      title: 'Musea Component Preview',
      chunk: getRequiredEntryChunk(build, 'client-frame-component'),
    },
  ];

  await Promise.all(pages.map((page) => writeMuseaPage(absoluteOutDir, page)));
}

async function prepareOutputDirectory(absoluteOutDir: string) {
  await rm(absoluteOutDir, { recursive: true, force: true });
  await mkdir(absoluteOutDir, { recursive: true });
}

export async function buildStaticMusea(
  cliOptions: {
    outDir?: string;
  } = {},
) {
  const museaConfig = await loadMuseaConfig(cliOptions);

  const absoluteOutDir = toAbsolutePath(museaConfig.outDir);

  await prepareOutputDirectory(absoluteOutDir);

  const build = await buildMuseaBundle(mergeFullConfig(museaConfig));

  await writeBundleFiles(absoluteOutDir, build);

  await writeMuseaPages(absoluteOutDir, build);

  return museaConfig;
}
