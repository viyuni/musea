<script setup lang="ts">
import type { ResolvedComponentMeta } from '@viyuni/vue-component-meta/types';

import Table from '../ui/Table.vue';
import TypeBadge from './TypeBadge.vue';

const { resolved, isPrimary = false } = defineProps<{
  resolved: ResolvedComponentMeta;
  isPrimary?: boolean;
}>();

function getTitle(resolved: ResolvedComponentMeta) {
  return resolved.name || resolved.file.split('/').pop()?.split('.').shift();
}
</script>
<template>
  <div class="ms:grid ms:grid-cols-1 ms:gap-9">
    <div class="ms:grid">
      <div class="ms:flex ms:items-center ms:gap-2">
        <h2 class="ms:text-xl ms:select-none ms:font-black ms:uppercase">
          {{ getTitle(resolved) }}
        </h2>
        <span
          class="ms:badge ms:badge-sm ms:capitalize"
          :class="isPrimary ? 'ms:badge-primary' : 'ms:badge-ghost'"
        >
          {{ isPrimary ? 'primary' : 'sub' }}
        </span>
      </div>

      <code class="ms:text-xs ms:opacity-60">{{ resolved.file }}</code>
    </div>

    <Table title="Props" :list="resolved.props ?? []" id-key="name">
      <template #name="{ row }">
        <span class="ms:badge ms:badge-soft ms:badge-primary ms:badge-sm ms:whitespace-nowrap">
          {{ row.name }}
        </span>
      </template>
      <template #type="{ row }">
        <TypeBadge>
          {{ row.originalType }}
        </TypeBadge>
      </template>
      <template #default="{ row }">
        <code class="ms:badge ms:badge-sm ms:badge-ghost">
          {{ row.default ?? '—' }}
        </code>
      </template>
      <template #description="{ row }">
        <div class="ms:text-sm ms:leading-relaxed ms:min-w-100">
          {{ row.description || '—' }}
        </div>
      </template>
    </Table>

    <Table title="Slots" :list="resolved.slots ?? []" id-key="name">
      <template #name="{ row }">
        <span class="ms:badge ms:badge-soft ms:badge-primary ms:badge-sm ms:whitespace-nowrap">
          {{ row.name }}
        </span>
      </template>
      <template #type="{ row }">
        <TypeBadge>
          {{ row.originalType }}
        </TypeBadge>
      </template>
      <template #description="{ row }">
        <div class="ms:text-sm ms:leading-relaxed ms:min-w-100">
          {{ row.description || '—' }}
        </div>
      </template>
    </Table>

    <Table title="Events" :list="resolved.events ?? []" id-key="name">
      <template #name="{ row }">
        <span class="ms:badge ms:badge-soft ms:badge-primary ms:badge-sm ms:whitespace-nowrap">
          {{ row.name }}
        </span>
      </template>
      <template #payload="{ row }">
        <TypeBadge>
          {{ row.originalType }}
        </TypeBadge>
      </template>
      <template #description="{ row }">
        <div class="ms:text-sm ms:leading-relaxed ms:min-w-100">
          {{ row.description || '—' }}
        </div>
      </template>
    </Table>

    <Table title="Exposed" :list="resolved.exposed ?? []" id-key="name">
      <template #name="{ row }">
        <div class="ms:badge ms:badge-info ms:badge-outline ms:font-mono ms:font-bold ms:text-xs">
          {{ row.name }}
        </div>
      </template>
      <template #type="{ row }">
        <TypeBadge>
          {{ row.originalType }}
        </TypeBadge>
      </template>
      <template #description="{ row }">
        <div class="ms:text-sm ms:leading-relaxed ms:min-w-100">
          {{ row.description || '—' }}
        </div>
      </template>
    </Table>
  </div>
</template>
