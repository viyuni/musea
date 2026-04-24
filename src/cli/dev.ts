import { createServer as createViteServer, mergeConfig, type InlineConfig } from 'vite';

import musea from '../vite/index.ts';
import { loadMuseaConfig } from './config.ts';

export async function devMusea(
  cliOptions: {
    host?: string | boolean;
    port?: number;
  } = {},
) {
  const museaConfig = await loadMuseaConfig(cliOptions);

  const devConfig = mergeConfig(museaConfig.vite, {
    appType: 'custom',
    configFile: false,
    root: process.cwd(),
    plugins: [musea(museaConfig)],
    server: {
      host: museaConfig.host,
      port: museaConfig.port,
      watch: {
        ignored: ['**/dist/**'],
      },
    },
  } satisfies InlineConfig);

  const server = await createViteServer(devConfig);

  await server.listen();

  return server;
}
