<script lang="ts" setup>
import { artStatuses, type ArtStatus } from '../../../types';

defineProps<{
  status: ArtStatus;
}>();

const style: Record<string, string> = {
  [artStatuses[0]]: 'ms:bg-green-100 ms:text-green-700',
  [artStatuses[1]]: 'ms:bg-orange-100 text-ms:orange-700',
  [artStatuses[2]]: 'ms:bg-red-100 ms:text-red-700',
};
</script>

<template>
  <span
    class="ms:px-1.5 ms:py-1 ms:rounded ms:text-[10px] ms:font-black ms:uppercase ms:tracking-wider ms:leading-none ms:border ms:border-black/5"
    :class="style[status]"
  >
    {{ status }}
  </span>
</template>
