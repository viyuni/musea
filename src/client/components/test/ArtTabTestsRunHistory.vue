<script setup lang="ts">
import { CheckCircle2, Clock, FileText, XCircle } from '@lucide/vue';

import type { ArtTestsRunHistoryItem } from '../../types/tests.ts';

defineProps<{
  runHistory: ArtTestsRunHistoryItem[];
}>();
</script>

<template>
  <div class="divide-y-4 divide-base-content/10">
    <article v-for="(entry, index) in runHistory" :key="entry.id" class="flex flex-col bg-base-100">
      <div
        class="px-4 py-3 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md"
        :class="[
          entry.result.ok
            ? 'bg-success/10 border-b border-success/20'
            : 'bg-error/10 border-b border-error/20',
          index === 0 ? '' : 'mt-4 border-t border-base-content/5',
        ]"
      >
        <div class="flex items-center gap-3">
          <CheckCircle2 v-if="entry.result.ok" :size="16" class="text-success" />
          <XCircle v-else :size="16" class="text-error" />
          <div>
            <div class="flex items-center gap-2">
              <p
                class="text-[10px] font-black uppercase tracking-widest"
                :class="entry.result.ok ? 'text-success' : 'text-error'"
              >
                {{ entry.result.ok ? 'Tests Passed' : 'Tests Failed' }}
              </p>
              <span
                class="text-[8px] font-bold text-base-content/30 uppercase tracking-widest bg-base-content/5 px-1.5 py-0.5 rounded"
                >{{ entry.source }}</span
              >
              <span
                v-if="index === 0"
                class="text-[8px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-1.5 py-0.5 rounded"
                >Latest</span
              >
            </div>
            <p class="text-[9px] opacity-40 font-mono mt-0.5">
              {{ new Date(entry.timestamp).toLocaleString() }} ·
              {{ entry.result.matchedSpecs }} specs
            </p>
          </div>
        </div>
        <div
          v-if="entry.result.message && !entry.result.ok"
          class="text-[9px] font-bold text-error/60 bg-error/10 px-2 py-1 rounded uppercase"
        >
          {{ entry.result.message }}
        </div>
      </div>

      <div class="divide-y divide-base-content/5">
        <div v-for="file in entry.result.files" :key="file.filepath" class="group">
          <div
            class="px-4 py-2 bg-base-content/[0.02] flex items-center justify-between border-b border-base-content/5"
          >
            <div class="flex items-center gap-3 min-w-0">
              <FileText :size="12" class="opacity-30" />
              <div class="min-w-0">
                <p class="text-[11px] font-bold font-mono truncate text-base-content/60">
                  {{ file.filepath }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <span class="text-[9px] font-bold text-base-content/20 uppercase tracking-tighter">
                {{ file.passed }}/{{ file.total }} Passed
              </span>
              <span
                v-if="file.failed > 0"
                class="text-[9px] font-bold text-error/60 uppercase tracking-tighter"
              >
                {{ file.failed }} Failed
              </span>
              <span
                v-if="file.durationMs != null"
                class="flex items-center gap-1 text-[9px] font-bold text-base-content/20 uppercase tracking-tighter"
              >
                <Clock :size="8" /> {{ file.durationMs }}ms
              </span>
            </div>
          </div>

          <ul class="divide-y divide-base-content/5 bg-base-100">
            <li v-for="test in file.tests" :key="test.name" class="px-4 py-2.5">
              <div class="flex items-start gap-3">
                <div class="mt-0.5 shrink-0">
                  <CheckCircle2 v-if="test.state === 'pass'" :size="11" class="text-success" />
                  <XCircle v-else-if="test.state === 'fail'" :size="11" class="text-error" />
                  <Clock v-else :size="11" class="text-base-content/20" />
                </div>
                <div class="flex-1 min-w-0 space-y-1.5">
                  <div class="flex items-center justify-between gap-4">
                    <p class="text-[11px] font-medium text-base-content/70 leading-tight">
                      {{ test.name }}
                    </p>
                    <span
                      v-if="test.durationMs != null"
                      class="text-[8px] font-mono text-base-content/20"
                      >{{ test.durationMs }}ms</span
                    >
                  </div>

                  <div v-if="test.errorMessage" class="space-y-1.5">
                    <div class="p-2 rounded bg-error/[0.03] border border-error/10">
                      <p
                        class="text-[10px] text-error/80 font-medium leading-relaxed font-mono whitespace-pre-wrap"
                      >
                        {{ test.errorMessage }}
                      </p>
                    </div>
                    <pre
                      v-if="test.errorStack"
                      class="p-2 rounded bg-base-content/[0.03] text-[9px] font-mono text-base-content/30 leading-relaxed overflow-x-auto whitespace-pre-wrap break-all"
                      >{{ test.errorStack }}</pre
                    >
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </article>
  </div>
</template>
