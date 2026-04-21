<script setup lang="ts">
import { Beaker, Play, RotateCcw, Trash2 } from '@lucide/vue';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

import { ROUTES } from '../../../shared/constants.ts';
import type { ArtManifest } from '../../../types/index.ts';
import {
  computeArtTestsRunResult,
  ensureArtTestsClient,
  subscribeArtTestsUpdates,
} from '../../composables/use-art-tests.ts';
import type {
  ArtTestsRunHistoryItem,
  ArtTestsRunResponse,
  ArtTestsRunTriggerResponse,
} from '../../types/tests.ts';
import ArtTabTestsConfiguredFilesState from '../test/ArtTabTestsConfiguredFilesState.vue';
import ArtTabTestsEmptyState from '../test/ArtTabTestsEmptyState.vue';
import ArtTabTestsRunErrorState from '../test/ArtTabTestsRunErrorState.vue';
import ArtTabTestsRunHistory from '../test/ArtTabTestsRunHistory.vue';

const props = defineProps<{
  art?: ArtManifest | null;
}>();

const isRunning = ref(false);
const runError = ref<string | null>(null);
const runHistory = ref<ArtTestsRunHistoryItem[]>([]);
const latestResultSignature = ref<string | null>(null);
const manualRunPending = ref(false);
let stopTestsUpdates: (() => void) | null = null;

const hasTests = computed(() => Boolean(props.art?.tests?.length));
const HISTORY_LIMIT = 5;

function appendRunHistory(result: ArtTestsRunResponse, source: ArtTestsRunHistoryItem['source']) {
  const signature = getRunResultSignature(result);
  if (latestResultSignature.value === signature) {
    return;
  }

  latestResultSignature.value = signature;
  runHistory.value.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    source,
    result,
  });
  runHistory.value = runHistory.value.slice(0, HISTORY_LIMIT);
}

function updateLatestRunHistory(
  result: ArtTestsRunResponse,
  source: ArtTestsRunHistoryItem['source'],
) {
  const nextSignature = getRunResultSignature(result);
  if (latestResultSignature.value === nextSignature) {
    return;
  }

  const latest = runHistory.value[0];
  if (!latest || latest.result.artId !== result.artId || latest.source !== source) {
    appendRunHistory(result, source);
    return;
  }

  latest.result = result;
  latest.timestamp = Date.now();
  latestResultSignature.value = nextSignature;
}

function clearRunHistory() {
  runHistory.value = [];
  latestResultSignature.value = null;
}

async function runTests() {
  const artId = props.art?.id;
  if (!artId) {
    return;
  }

  isRunning.value = true;
  runError.value = null;

  try {
    const response = await fetch(ROUTES.testRun, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artId }),
    });
    const payload = (await response.json()) as
      | ArtTestsRunTriggerResponse
      | { statusMessage?: string };

    if (!response.ok || !('ok' in payload) || !payload.ok) {
      runError.value =
        'statusMessage' in payload
          ? payload.statusMessage || 'Failed to run tests'
          : ('message' in payload && payload.message) || 'Failed to run tests';
      isRunning.value = false;
      return;
    }

    manualRunPending.value = true;
  } catch (error) {
    runError.value = error instanceof Error ? error.message : 'Failed to run tests';
    isRunning.value = false;
  }
}

function handleTaskUpdate() {
  const result = computeArtTestsRunResult(props.art);
  if (!result) {
    return;
  }

  const source = manualRunPending.value ? 'manual' : 'watch';
  if (!manualRunPending.value && !isRunning.value) {
    return;
  }

  updateLatestRunHistory(result, source);
}

function handleRunFinished() {
  const result = computeArtTestsRunResult(props.art);
  if (!result) {
    return;
  }

  const source = manualRunPending.value ? 'manual' : 'watch';
  appendRunHistory(result, source);
  manualRunPending.value = false;
  runError.value = null;
  isRunning.value = false;
}

onMounted(async () => {
  try {
    await ensureArtTestsClient();
    stopTestsUpdates = subscribeArtTestsUpdates({
      onFinished: handleRunFinished,
      onTaskUpdate: handleTaskUpdate,
    });
  } catch (error) {
    runError.value = error instanceof Error ? error.message : 'Failed to connect to Vitest API';
  }
});

onUnmounted(() => {
  stopTestsUpdates?.();
  stopTestsUpdates = null;
  manualRunPending.value = false;
});

watch(
  () => props.art?.id,
  (next, prev) => {
    if (prev && prev !== next) {
      clearRunHistory();
      runError.value = null;
      manualRunPending.value = false;
    }

    if (!next) {
      clearRunHistory();
      runError.value = null;
    }
  },
);

function getRunResultSignature(result: ArtTestsRunResponse) {
  return JSON.stringify({
    ok: result.ok,
    artId: result.artId,
    matchedSpecs: result.matchedSpecs,
    files: result.files.map((file) => ({
      filepath: file.filepath,
      passed: file.passed,
      failed: file.failed,
      total: file.total,
      tests: file.tests.map((test) => ({
        name: test.name,
        state: test.state,
        errorMessage: test.errorMessage,
      })),
    })),
  });
}
</script>

<template>
  <div class="flex flex-col h-full">
    <header
      class="flex items-center justify-between px-4 py-2 border-b border-base-content/5 bg-base-200/5 sticky top-content z-20 backdrop-blur-md shrink-0"
    >
      <div class="flex items-center gap-2">
        <Beaker :size="14" class="text-primary opacity-70" />
        <span class="text-[10px] font-black uppercase tracking-widest opacity-40">Test Runner</span>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="runHistory.length > 0"
          class="btn btn-ghost btn-xs h-7 gap-1.5 text-[9px] font-bold uppercase tracking-widest opacity-30 hover:opacity-100 px-2"
          @click="clearRunHistory"
        >
          <Trash2 :size="10" />
          Clear History
        </button>
        <button
          class="btn btn-primary btn-xs h-7 gap-1.5 text-[9px] font-bold uppercase tracking-widest"
          :disabled="!hasTests || isRunning"
          @click="runTests"
        >
          <component
            :is="isRunning ? RotateCcw : Play"
            :size="10"
            :class="{ 'animate-spin': isRunning }"
          />
          {{ isRunning ? 'Running' : 'Run Tests' }}
        </button>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto overflow-x-hidden">
      <ArtTabTestsEmptyState v-if="!hasTests" />

      <div v-else class="flex flex-col h-full">
        <ArtTabTestsConfiguredFilesState v-if="runHistory.length === 0 && !runError" :art="art" />
        <ArtTabTestsRunErrorState v-if="runError" :run-error="runError" />
        <ArtTabTestsRunHistory :run-history="runHistory" />
      </div>
    </main>
  </div>
</template>
