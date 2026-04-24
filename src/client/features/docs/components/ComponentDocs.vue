<script setup lang="ts">
import type { ResolvedComponentMeta } from '@viyuni/vue-component-meta/types';

import Table from '../../../shared/ui/Table.vue';
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
  <div class="vi:grid vi:grid-cols-1 vi:gap-9">
    <div class="vi:grid">
      <div class="vi:flex vi:items-center vi:gap-2">
        <h2 class="vi:text-xl vi:select-none vi:font-black vi:uppercase">
          {{ getTitle(resolved) }}
        </h2>
        <span
          class="vi:vi-badge vi:vi-badge-sm vi:capitalize"
          :class="isPrimary ? 'vi:vi-badge-primary' : 'vi:vi-badge-ghost'"
        >
          {{ isPrimary ? 'primary' : 'sub' }}
        </span>
      </div>

      <code class="vi:text-xs vi:opacity-60">{{ resolved.file }}</code>
    </div>

    <Table title="Props" :list="resolved.props ?? []" id-key="name">
      <template #name="{ row }">
        <span
          class="vi:vi-badge vi:vi-badge-soft vi:vi-badge-primary vi:vi-badge-sm vi:whitespace-nowrap"
        >
          {{ row.name }}
        </span>
      </template>
      <template #type="{ row }">
        <TypeBadge>
          {{ row.originalType }}
        </TypeBadge>
      </template>
      <template #default="{ row }">
        <code class="vi:vi-badge vi:vi-badge-sm vi:vi-badge-ghost">
          {{ row.default ?? '—' }}
        </code>
      </template>
      <template #description="{ row }">
        <div class="vi:text-sm vi:leading-relaxed vi:min-w-100">
          {{ row.description || '—' }}
        </div>
      </template>
    </Table>

    <Table title="Slots" :list="resolved.slots ?? []" id-key="name">
      <template #name="{ row }">
        <span
          class="vi:vi-badge vi:vi-badge-soft vi:vi-badge-primary vi:vi-badge-sm vi:whitespace-nowrap"
        >
          {{ row.name }}
        </span>
      </template>
      <template #type="{ row }">
        <TypeBadge>
          {{ row.originalType }}
        </TypeBadge>
      </template>
      <template #description="{ row }">
        <div class="vi:text-sm vi:leading-relaxed vi:min-w-100">
          {{ row.description || '—' }}
        </div>
      </template>
    </Table>

    <Table title="Events" :list="resolved.events ?? []" id-key="name">
      <template #name="{ row }">
        <span
          class="vi:vi-badge vi:vi-badge-soft vi:vi-badge-primary vi:vi-badge-sm vi:whitespace-nowrap"
        >
          {{ row.name }}
        </span>
      </template>
      <template #payload="{ row }">
        <TypeBadge>
          {{ row.originalType }}
        </TypeBadge>
      </template>
      <template #description="{ row }">
        <div class="vi:text-sm vi:leading-relaxed vi:min-w-100">
          {{ row.description || '—' }}
        </div>
      </template>
    </Table>

    <Table title="Exposed" :list="resolved.exposed ?? []" id-key="name">
      <template #name="{ row }">
        <div
          class="vi:vi-badge vi:vi-badge-info vi:vi-badge-outline vi:font-mono vi:font-bold vi:text-xs"
        >
          {{ row.name }}
        </div>
      </template>
      <template #type="{ row }">
        <TypeBadge>
          {{ row.originalType }}
        </TypeBadge>
      </template>
      <template #description="{ row }">
        <div class="vi:text-sm vi:leading-relaxed vi:min-w-100">
          {{ row.description || '—' }}
        </div>
      </template>
    </Table>
  </div>
</template>
