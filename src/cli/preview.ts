import { existsSync } from 'node:fs';
import process from 'node:process';

import { preview } from 'vite';

import { toAbsolutePath } from '../shared/utils.ts';
import { loadMuseaConfig } from './config.ts';

export async function previewStaticMusea(cliOptions: {
  outDir?: string;
  host?: string | boolean;
  port?: number;
}) {
  const museaConfig = await loadMuseaConfig(cliOptions);

  const absoluteOutDir = toAbsolutePath(museaConfig.outDir);

  if (!existsSync(absoluteOutDir)) {
    throw new Error(`Musea static site not found at ${museaConfig.outDir}`);
  }

  return await preview({
    configFile: false,
    root: process.cwd(),
    publicDir: false,
    appType: 'mpa',
    build: {
      outDir: museaConfig.outDir,
    },
    preview: {
      host: museaConfig.host,
      port: museaConfig.port,
    },
  });
}
