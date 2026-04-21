<script setup lang="ts">
import type { ResolvedComponentMeta } from '@viyuni/vue-component-meta/types';

import Table from '../ui/Table.vue';

const { resolved, isPrimary = false } = defineProps<{
  resolved: ResolvedComponentMeta;
  isPrimary?: boolean;
}>();

function getTitle(resolved: ResolvedComponentMeta) {
  return resolved.name || resolved.file.split('/').pop()?.split('.').shift();
}
</script>
<template>
  <div class="grid gap-9">
    <div class="grid">
      <div class="flex items-center gap-2">
        <h2 class="text-xl select-none font-black uppercase">
          {{ getTitle(resolved) }}
        </h2>
        <span
          class="badge badge-sm capitalize"
          :class="isPrimary ? 'badge-primary' : 'badge-ghost'"
        >
          {{ isPrimary ? 'primary' : 'sub' }}
        </span>
      </div>

      <code class="text-xs opacity-60">{{ resolved.file }}</code>
    </div>

    <Table title="Props" :list="resolved.props ?? []" id-key="name">
      <template #name="{ row }">
        <span class="badge badge-soft badge-primary badge-sm whitespace-nowrap">
          {{ row.name }}
        </span>
      </template>
      <template #type="{ row }">
        <code class="badge badge-sm badge-ghost whitespace-nowrap">
          {{ row.originalType }}
        </code>
      </template>
      <template #default="{ row }">
        <code class="badge badge-sm badge-ghost whitespace-nowrap">
          {{ row.default ?? '—' }}
        </code>
      </template>
      <template #description="{ row }">{{ row.description }}</template>
    </Table>

    <Table title="Slots" :list="resolved.slots ?? []" id-key="name">
      <template #name="{ row }">
        <span class="badge badge-soft badge-primary badge-sm whitespace-nowrap">
          {{ row.name }}
        </span>
      </template>
      <template #type="{ row }">
        <code class="badge badge-sm badge-ghost whitespace-nowrap">
          {{ row.originalType }}
        </code>
      </template>
      <template #description="{ row }">
        <span class="text-sm opacity-70 leading-relaxed">
          {{ row.description || '—' }}
        </span>
      </template>
    </Table>

    <Table title="Events" :list="resolved.events ?? []" id-key="name">
      <template #name="{ row }">
        <span class="badge badge-soft badge-primary badge-sm whitespace-nowrap">
          {{ row.name }}
        </span>
      </template>
      <template #payload="{ row }">
        <code class="badge badge-sm badge-ghost whitespace-nowrap">
          {{ row.originalType }}
        </code>
      </template>
      <template #description="{ row }">
        <span class="text-sm opacity-70 leading-relaxed max-w-sm whitespace-normal">
          {{ row.description || '—' }}
        </span>
      </template>
    </Table>

    <Table title="Exposed" :list="resolved.exposed ?? []" id-key="name">
      <template #name="{ row }">
        <div class="badge badge-info badge-outline font-mono font-bold text-xs">
          {{ row.name }}
        </div>
      </template>
      <template #type="{ row }">
        <code class="badge badge-sm badge-ghost whitespace-nowrap">
          {{ row.originalType }}
        </code>
      </template>
      <template #description="{ row }">
        <span class="text-sm opacity-70 leading-relaxed max-w-sm whitespace-normal">
          {{ row.description || '—' }}
        </span>
      </template>
    </Table>
  </div>
</template>
