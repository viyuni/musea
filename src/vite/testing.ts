import path from 'node:path';

import { normalizePath } from 'unplugin-utils';
import { type Vitest } from 'vitest/node';
import * as vitestNode from 'vitest/node';

let vitestInstance: Vitest | undefined;
let vitestInitPromise: Promise<Vitest> | undefined;

export type ArtTestsApiInfo = {
  port: number;
  token: string;
};

export type ArtTestsTriggerResult = {
  matchedSpecs: number;
};

async function initVitest(root: string) {
  const vitest = await vitestNode?.createVitest(
    'test',
    {
      watch: true,
      root,
      passWithNoTests: true,
      reporters: 'default',
      api: {},
      ui: true,
      open: false,
    },
    { root },
  );

  await vitest.standalone();
  vitestInstance = vitest;
  return vitest;
}

export async function getVitest(root: string) {
  if (vitestInstance) {
    return vitestInstance;
  }

  if (!vitestInitPromise) {
    vitestInitPromise = initVitest(root);
  }

  return await vitestInitPromise;
}

export async function getArtTestsApiInfo(root: string): Promise<ArtTestsApiInfo> {
  const vitest = await getVitest(root);
  const api = (
    vitest as unknown as {
      config?: {
        api?: {
          port?: number;
          token?: string;
        };
      };
    }
  ).config?.api;

  return {
    port: typeof api?.port === 'number' ? api.port : 51204,
    token: typeof api?.token === 'string' ? api.token : '0',
  };
}

export async function triggerArtTestsByFiles(
  root: string,
  files: string[],
): Promise<ArtTestsTriggerResult> {
  const vitest = await getVitest(root);
  const specifications = files.flatMap((file) => {
    const normalizedPath = normalizePath(file);
    const absolutePath = normalizePath(path.resolve(root, normalizedPath));
    const candidates = [absolutePath, normalizedPath, `/${normalizedPath}`];

    return candidates.flatMap((candidate) => vitest.getModuleSpecifications(candidate));
  });

  if (!specifications.length) {
    return { matchedSpecs: 0 };
  }

  await vitest.rerunTestSpecifications(specifications);
  return { matchedSpecs: specifications.length };
}
