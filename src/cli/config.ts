import { defu } from 'defu';
import { createConfigLoader } from 'unconfig';
import { sourceObjectFields } from 'unconfig/presets';

import { toRelativePath } from '../shared/utils.ts';
import { variantRenderModes, type MuseaConfig, type VariantRenderMode } from '../types/index.ts';

export type ResolvedMuseaConfig = Required<MuseaConfig>;

export const DEFAULT_OUT_DIR = '.musea' as const;
export const DEFAULT_SETUP_FILE = 'musea.setup.ts' as const;

function createMuseaConfigLoader(cwd = process.cwd()) {
  return createConfigLoader<MuseaConfig>({
    cwd,
    merge: false,
    sources: [
      {
        files: 'musea.config',
      },
      sourceObjectFields({ files: 'vite.config', fields: 'musea' }),
    ],
  });
}

function normalizeVariantRenderMode(mode?: string): VariantRenderMode {
  return variantRenderModes.includes(mode as VariantRenderMode)
    ? (mode as VariantRenderMode)
    : 'iframe';
}

function normalMuseaConfig(config: MuseaConfig = {}): ResolvedMuseaConfig {
  return {
    patterns: config.patterns ?? ['**/*.art.vue'],
    ignore: config.ignore ?? ['**/node_modules/**', '**/dist/**'],
    sourceMap: config.sourceMap ?? true,
    tsconfig: config.tsconfig ?? 'tsconfig.json',
    outDir: toRelativePath(config.outDir ?? DEFAULT_OUT_DIR),
    setupFile: config.setupFile ?? DEFAULT_SETUP_FILE,
    port: config.port ?? 3000,
    host: config.host ?? false,
    variantRenderMode: normalizeVariantRenderMode(config.variantRenderMode),
    vite: config.vite ?? {},
  };
}

export async function loadMuseaConfig(overrides: MuseaConfig = {}, cwd = process.cwd()) {
  const loader = createMuseaConfigLoader(cwd);
  const loaded = await loader.load();

  return normalMuseaConfig(defu(overrides, loaded.config));
}

export async function findMuseaConfigFiles(cwd = process.cwd()) {
  const loader = createMuseaConfigLoader(cwd);
  return await loader.findConfigs();
}
