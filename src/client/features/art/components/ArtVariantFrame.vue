<script setup lang="ts">
import IframeView from '../../../shared/components/IframeView.vue';
import { useTheme } from '../../../shared/composables/use-theme';

const props = defineProps<{
  url: string;
}>();

const { activeTheme } = useTheme();
</script>

<template>
  <IframeView
    :url="props.url"
    :fill="true"
    :theme="activeTheme"
    class="vi:w-full"
    placeholder-height="60px"
  />
</template>
