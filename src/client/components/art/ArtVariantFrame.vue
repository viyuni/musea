<script setup lang="ts">
import { useTheme } from '../../composables/use-theme';
import IframeView from '../common/IframeView.vue';

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
