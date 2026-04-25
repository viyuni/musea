<script setup lang="ts">
import setupApp from 'virtual:musea-setup';
import { computed, createApp, onBeforeUnmount, onMounted, useTemplateRef, type App } from 'vue';

import { loadVariantComponent } from '../../art/composables/use-art-manifest';

const props = defineProps<{
  artId: string;
  variantName: string;
}>();

const appRef = useTemplateRef('appRef');

let app: App | undefined;

onMounted(async () => {
  if (!appRef.value) {
    return;
  }

  app = createApp(loadVariantComponent(props.artId, props.variantName));
  await setupApp(app);
  app.mount(appRef.value);
});

onBeforeUnmount(() => {
  app?.unmount();
});
</script>

<template>
  <div ref="appRef"></div>
</template>
