<script setup lang="ts">
import { CheckCircle2, Clock, FileText, XCircle } from '@lucide/vue';

import type { ArtTestsRunHistoryItem } from '../types/tests.ts';

defineProps<{
  runHistory: ArtTestsRunHistoryItem[];
}>();
</script>

<template>
  <div class="vi:divide-y-4 vi:divide-base-content/10">
    <article
      v-for="(entry, index) in runHistory"
      :key="entry.id"
      class="vi:flex vi:flex-col vi:bg-base-100"
    >
      <div
        class="vi:px-4 vi:py-3 vi:flex vi:items-center vi:justify-between vi:sticky vi:top-0 vi:z-10 vi:backdrop-blur-md"
        :class="[
          entry.result.ok
            ? 'bg-success/10 border-b border-success/20'
            : 'bg-error/10 border-b border-error/20',
          index === 0 ? '' : 'mt-4 border-t border-base-content/5',
        ]"
      >
        <div class="vi:flex vi:items-center vi:gap-3">
          <CheckCircle2 v-if="entry.result.ok" :size="16" class="vi:text-success" />
          <XCircle v-else :size="16" class="vi:text-error" />
          <div>
            <div class="vi:flex vi:items-center vi:gap-2">
              <p
                class="vi:text-[10px] vi:font-black vi:uppercase vi:tracking-widest"
                :class="entry.result.ok ? 'text-success' : 'text-error'"
              >
                {{ entry.result.ok ? 'Tests Passed' : 'Tests Failed' }}
              </p>
              <span
                class="vi:text-[8px] vi:font-bold vi:text-base-content/30 vi:uppercase vi:tracking-widest vi:bg-base-content/5 vi:px-1.5 vi:py-0.5 vi:rounded"
                >{{ entry.source }}</span
              >
              <span
                v-if="index === 0"
                class="vi:text-[8px] vi:font-bold vi:text-primary vi:uppercase vi:tracking-widest vi:bg-primary/10 vi:px-1.5 vi:py-0.5 vi:rounded"
                >Latest</span
              >
            </div>
            <p class="vi:text-[9px] vi:opacity-40 vi:font-mono vi:mt-0.5">
              {{ new Date(entry.timestamp).toLocaleString() }} ·
              {{ entry.result.matchedSpecs }} specs
            </p>
          </div>
        </div>
        <div
          v-if="entry.result.message && !entry.result.ok"
          class="vi:text-[9px] vi:font-bold vi:text-error/60 vi:bg-error/10 vi:px-2 vi:py-1 vi:rounded vi:uppercase"
        >
          {{ entry.result.message }}
        </div>
      </div>

      <div class="vi:divide-y vi:divide-base-content/5">
        <div v-for="file in entry.result.files" :key="file.filepath" class="vi:group">
          <div
            class="vi:px-4 vi:py-2 vi:bg-base-content/[0.02] vi:flex vi:items-center vi:justify-between vi:border-b vi:border-base-content/5"
          >
            <div class="vi:flex vi:items-center vi:gap-3 vi:min-w-0">
              <FileText :size="12" class="vi:opacity-30" />
              <div class="vi:min-w-0">
                <p
                  class="vi:text-[11px] vi:font-bold vi:font-mono vi:truncate vi:text-base-content/60"
                >
                  {{ file.filepath }}
                </p>
              </div>
            </div>
            <div class="vi:flex vi:items-center vi:gap-3 vi:shrink-0">
              <span
                class="vi:text-[9px] vi:font-bold vi:text-base-content/20 vi:uppercase vi:tracking-tighter"
              >
                {{ file.passed }}/{{ file.total }} Passed
              </span>
              <span
                v-if="file.failed > 0"
                class="vi:text-[9px] vi:font-bold vi:text-error/60 vi:uppercase vi:tracking-tighter"
              >
                {{ file.failed }} Failed
              </span>
              <span
                v-if="file.durationMs != null"
                class="vi:flex vi:items-center vi:gap-1 vi:text-[9px] vi:font-bold vi:text-base-content/20 vi:uppercase vi:tracking-tighter"
              >
                <Clock :size="8" /> {{ file.durationMs }}ms
              </span>
            </div>
          </div>

          <ul class="vi:divide-y vi:divide-base-content/5 vi:bg-base-100">
            <li v-for="test in file.tests" :key="test.name" class="vi:px-4 vi:py-2.5">
              <div class="vi:flex vi:items-start vi:gap-3">
                <div class="vi:mt-0.5 vi:shrink-0">
                  <CheckCircle2 v-if="test.state === 'pass'" :size="11" class="vi:text-success" />
                  <XCircle v-else-if="test.state === 'fail'" :size="11" class="vi:text-error" />
                  <Clock v-else :size="11" class="vi:text-base-content/20" />
                </div>
                <div class="vi:flex-1 vi:min-w-0 vi:space-y-1.5">
                  <div class="vi:flex vi:items-center vi:justify-between vi:gap-4">
                    <p
                      class="vi:text-[11px] vi:font-medium vi:text-base-content/70 vi:leading-tight"
                    >
                      {{ test.name }}
                    </p>
                    <span
                      v-if="test.durationMs != null"
                      class="vi:text-[8px] vi:font-mono vi:text-base-content/20"
                      >{{ test.durationMs }}ms</span
                    >
                  </div>

                  <div v-if="test.errorMessage" class="vi:space-y-1.5">
                    <div class="vi:p-2 vi:rounded vi:bg-error/[0.03] vi:border vi:border-error/10">
                      <p
                        class="vi:text-[10px] vi:text-error/80 vi:font-medium vi:leading-relaxed vi:font-mono vi:whitespace-pre-wrap"
                      >
                        {{ test.errorMessage }}
                      </p>
                    </div>
                    <pre
                      v-if="test.errorStack"
                      class="vi:p-2 vi:rounded vi:bg-base-content/[0.03] vi:text-[9px] vi:font-mono vi:text-base-content/30 vi:leading-relaxed vi:overflow-x-auto vi:whitespace-pre-wrap vi:break-all"
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
