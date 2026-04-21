import { createClient, getTasks, type VitestClient } from '@vitest/ws-client';

import { ROUTES } from '../../shared/constants.ts';
import type { ArtManifest } from '../../types/index.ts';
import type { ArtTestsRunResponse } from '../types/tests.ts';

type ArtTestsUpdatesListener = {
  onFinished?: () => void;
  onTaskUpdate?: () => void;
};

type TaskLike = {
  type?: string;
  name?: string;
  mode?: string;
  filepath?: string;
  result?: {
    state?: string;
    duration?: number;
    errors?: unknown[];
  };
  tasks?: TaskLike[];
};

const testsClient = {
  current: null as VitestClient | null,
};

let connectPromise: Promise<VitestClient> | null = null;
const listeners = new Set<ArtTestsUpdatesListener>();

function notifyTaskUpdate() {
  for (const listener of listeners) {
    listener.onTaskUpdate?.();
  }
}

function notifyFinished() {
  for (const listener of listeners) {
    listener.onFinished?.();
  }
}

export function subscribeArtTestsUpdates(listener: ArtTestsUpdatesListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function ensureArtTestsClient() {
  if (testsClient.current) {
    return testsClient.current;
  }

  if (!connectPromise) {
    connectPromise = createArtTestsClient();
  }

  return await connectPromise;
}

async function createArtTestsClient() {
  const response = await fetch(ROUTES.TESTS_API);
  const payload = (await response.json()) as { ok?: boolean; port?: number; token?: string };
  if (!response.ok || !payload.ok || typeof payload.port !== 'number') {
    throw new Error('Cannot resolve Vitest API connection info');
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.hostname}:${payload.port}/__vitest_api__?token=${payload.token ?? '0'}`;
  const client = createClient(wsUrl, {
    handlers: {
      onTaskUpdate() {
        notifyTaskUpdate();
      },
      onFinished() {
        notifyFinished();
      },
    },
  });

  await client.waitForConnection();
  const initialFiles = await client.rpc.getFiles();
  client.state.collectFiles(initialFiles);

  testsClient.current = client;
  notifyTaskUpdate();
  return client;
}

export function computeArtTestsRunResult(art?: ArtManifest | null): ArtTestsRunResponse | null {
  if (!art?.id || !art.tests.length || !testsClient.current) {
    return null;
  }

  const files = testsClient.current.state.getFiles();
  const matchedFiles = files
    .filter((file) => isTargetTestFile(file.filepath, art.tests))
    .map((file) => buildFileReport(file.filepath, file as TaskLike));

  if (!matchedFiles.length) {
    return null;
  }

  const hasFailedTests = matchedFiles.some((file) => file.failed > 0);
  return {
    ok: !hasFailedTests,
    message: hasFailedTests ? 'Some tests failed' : undefined,
    artId: art.id,
    matchedSpecs: matchedFiles.length,
    files: matchedFiles,
  };
}

function isTargetTestFile(filepath: string | undefined, tests: string[]) {
  if (!filepath) {
    return false;
  }

  const normalizedFile = normalizePath(filepath);
  return tests.some((testFile) => {
    const normalizedTestFile = normalizePath(testFile).replace(/^\.?\//, '');
    return (
      normalizedFile === normalizedTestFile ||
      normalizedFile.endsWith(`/${normalizedTestFile}`) ||
      normalizedFile === `/${normalizedTestFile}`
    );
  });
}

function buildFileReport(filepath: string | undefined, task: TaskLike) {
  const tests = getTasks(task as never).filter((entry) => entry.type === 'test');
  const testItems = tests.map((test) => {
    const normalizedState = mapTaskState(test as TaskLike);
    const error = test.result?.errors?.[0];
    return {
      name: test.name || 'Unnamed test',
      state: normalizedState,
      durationMs: test.result?.duration,
      errorMessage: getTaskErrorMessage(error),
      errorStack: getTaskErrorStack(error),
    };
  });

  return {
    filepath: normalizePath(filepath ?? 'unknown-file'),
    total: testItems.length,
    passed: testItems.filter((test) => test.state === 'pass').length,
    failed: testItems.filter((test) => test.state === 'fail').length,
    durationMs: task.result?.duration,
    tests: testItems,
  };
}

function mapTaskState(task: TaskLike): 'pass' | 'fail' | 'skip' | 'todo' | 'unknown' {
  const state = task.result?.state;
  if (state === 'pass' || state === 'fail' || state === 'skip' || state === 'todo') {
    return state;
  }
  if (task.mode === 'skip') {
    return 'skip';
  }
  if (task.mode === 'todo') {
    return 'todo';
  }

  return 'unknown';
}

function normalizePath(file: string) {
  return file.replace(/\\/g, '/');
}

function getTaskErrorMessage(error: unknown) {
  if (!error) {
    return undefined;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && 'message' in (error as object)) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }

  return String(error);
}

function getTaskErrorStack(error: unknown) {
  if (!error) {
    return undefined;
  }
  if (error instanceof Error) {
    return error.stack;
  }
  if (typeof error === 'object' && 'stack' in (error as object)) {
    const stack = (error as { stack?: unknown }).stack;
    if (typeof stack === 'string') {
      return stack;
    }
  }

  return undefined;
}
