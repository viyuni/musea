<script setup lang="ts">
import { CheckCircle2, Clock, FileText, XCircle } from '@lucide/vue';

import type { ArtTestsRunHistoryItem } from '../../types/tests.ts';

defineProps<{
  runHistory: ArtTestsRunHistoryItem[];
}>();
</script>

<template>
  <div class="ms:divide-y-4 ms:divide-base-content/10">
    <article
      v-for="(entry, index) in runHistory"
      :key="entry.id"
      class="ms:flex ms:flex-col ms:bg-base-100"
    >
      <div
        class="ms:px-4 ms:py-3 ms:flex ms:items-center ms:justify-between ms:sticky ms:top-0 ms:z-10 ms:backdrop-blur-md"
        :class="[
          entry.result.ok
            ? 'bg-success/10 border-b border-success/20'
            : 'bg-error/10 border-b border-error/20',
          index === 0 ? '' : 'mt-4 border-t border-base-content/5',
        ]"
      >
        <div class="ms:flex ms:items-center ms:gap-3">
          <CheckCircle2 v-if="entry.result.ok" :size="16" class="ms:text-success" />
          <XCircle v-else :size="16" class="ms:text-error" />
          <div>
            <div class="ms:flex ms:items-center ms:gap-2">
              <p
                class="ms:text-[10px] ms:font-black ms:uppercase ms:tracking-widest"
                :class="entry.result.ok ? 'text-success' : 'text-error'"
              >
                {{ entry.result.ok ? 'Tests Passed' : 'Tests Failed' }}
              </p>
              <span
                class="ms:text-[8px] ms:font-bold ms:text-base-content/30 ms:uppercase ms:tracking-widest ms:bg-base-content/5 ms:px-1.5 ms:py-0.5 ms:rounded"
                >{{ entry.source }}</span
              >
              <span
                v-if="index === 0"
                class="ms:text-[8px] ms:font-bold ms:text-primary ms:uppercase ms:tracking-widest ms:bg-primary/10 ms:px-1.5 ms:py-0.5 ms:rounded"
                >Latest</span
              >
            </div>
            <p class="ms:text-[9px] ms:opacity-40 ms:font-mono ms:mt-0.5">
              {{ new Date(entry.timestamp).toLocaleString() }} ·
              {{ entry.result.matchedSpecs }} specs
            </p>
          </div>
        </div>
        <div
          v-if="entry.result.message && !entry.result.ok"
          class="ms:text-[9px] ms:font-bold ms:text-error/60 ms:bg-error/10 ms:px-2 ms:py-1 ms:rounded ms:uppercase"
        >
          {{ entry.result.message }}
        </div>
      </div>

      <div class="ms:divide-y ms:divide-base-content/5">
        <div v-for="file in entry.result.files" :key="file.filepath" class="ms:group">
          <div
            class="ms:px-4 ms:py-2 ms:bg-base-content/[0.02] ms:flex ms:items-center ms:justify-between ms:border-b ms:border-base-content/5"
          >
            <div class="ms:flex ms:items-center ms:gap-3 ms:min-w-0">
              <FileText :size="12" class="ms:opacity-30" />
              <div class="ms:min-w-0">
                <p
                  class="ms:text-[11px] ms:font-bold ms:font-mono ms:truncate ms:text-base-content/60"
                >
                  {{ file.filepath }}
                </p>
              </div>
            </div>
            <div class="ms:flex ms:items-center ms:gap-3 ms:shrink-0">
              <span
                class="ms:text-[9px] ms:font-bold ms:text-base-content/20 ms:uppercase ms:tracking-tighter"
              >
                {{ file.passed }}/{{ file.total }} Passed
              </span>
              <span
                v-if="file.failed > 0"
                class="ms:text-[9px] ms:font-bold ms:text-error/60 ms:uppercase ms:tracking-tighter"
              >
                {{ file.failed }} Failed
              </span>
              <span
                v-if="file.durationMs != null"
                class="ms:flex ms:items-center ms:gap-1 ms:text-[9px] ms:font-bold ms:text-base-content/20 ms:uppercase ms:tracking-tighter"
              >
                <Clock :size="8" /> {{ file.durationMs }}ms
              </span>
            </div>
          </div>

          <ul class="ms:divide-y ms:divide-base-content/5 ms:bg-base-100">
            <li v-for="test in file.tests" :key="test.name" class="ms:px-4 ms:py-2.5">
              <div class="ms:flex ms:items-start ms:gap-3">
                <div class="ms:mt-0.5 ms:shrink-0">
                  <CheckCircle2 v-if="test.state === 'pass'" :size="11" class="ms:text-success" />
                  <XCircle v-else-if="test.state === 'fail'" :size="11" class="ms:text-error" />
                  <Clock v-else :size="11" class="ms:text-base-content/20" />
                </div>
                <div class="ms:flex-1 ms:min-w-0 ms:space-y-1.5">
                  <div class="ms:flex ms:items-center ms:justify-between ms:gap-4">
                    <p
                      class="ms:text-[11px] ms:font-medium ms:text-base-content/70 ms:leading-tight"
                    >
                      {{ test.name }}
                    </p>
                    <span
                      v-if="test.durationMs != null"
                      class="ms:text-[8px] ms:font-mono ms:text-base-content/20"
                      >{{ test.durationMs }}ms</span
                    >
                  </div>

                  <div v-if="test.errorMessage" class="ms:space-y-1.5">
                    <div class="ms:p-2 ms:rounded ms:bg-error/[0.03] ms:border ms:border-error/10">
                      <p
                        class="ms:text-[10px] ms:text-error/80 ms:font-medium ms:leading-relaxed ms:font-mono ms:whitespace-pre-wrap"
                      >
                        {{ test.errorMessage }}
                      </p>
                    </div>
                    <pre
                      v-if="test.errorStack"
                      class="ms:p-2 ms:rounded ms:bg-base-content/[0.03] ms:text-[9px] ms:font-mono ms:text-base-content/30 ms:leading-relaxed ms:overflow-x-auto ms:whitespace-pre-wrap ms:break-all"
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
