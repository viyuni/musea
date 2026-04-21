<script lang="ts" setup>
import { artStatuses, type ArtStatus } from '../../../types';

defineProps<{
  status: ArtStatus;
}>();

const style: Record<string, string> = {
  [artStatuses[0]]: 'bg-green-100 text-green-700',
  [artStatuses[1]]: 'bg-orange-100 text-orange-700',
  [artStatuses[2]]: 'bg-red-100 text-red-700',
};
</script>

<template>
  <span
    class="px-1.5 py-1 rounded text-[10px] font-black uppercase tracking-wider leading-none border border-black/5"
    :class="style[status]"
  >
    {{ status }}
  </span>
</template>
