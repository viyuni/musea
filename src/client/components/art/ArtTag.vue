<script lang="ts" setup>
import { artStatuses, type ArtStatus } from '../../../types';

defineProps<{
  status: ArtStatus;
}>();

const style: Record<string, string> = {
  [artStatuses[0]]: 'vi:bg-green-100 vi:text-green-700',
  [artStatuses[1]]: 'vi:bg-orange-100 vi:text-orange-700',
  [artStatuses[2]]: 'vi:bg-red-100 vi:text-red-700',
};
</script>

<template>
  <span
    class="vi:px-1.5 vi:py-1 vi:rounded vi:text-[10px] vi:font-black vi:uppercase vi:tracking-wider vi:leading-none vi:border vi:border-black/5"
    :class="style[status]"
  >
    {{ status }}
  </span>
</template>
