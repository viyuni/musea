import setupMuseaApp from 'virtual:musea-setup';
import { createApp, defineComponent, h } from 'vue';

import { useComponentPreview } from './composables/use-component-preview.ts';
import { useInspector } from './composables/use-inspector.ts';

const query = new URLSearchParams(location.search);
const artId = query.get('artId') ?? '';
const initialProps = JSON.parse(query.get('props') ?? '{}');

useInspector();

const App = defineComponent({
  name: 'InterceptedComponentPreview',
  setup() {
    const { loadedComponent, liveProps, liveSlots, previewRef } = useComponentPreview({
      artId,
      initialProps,
    });

    return () =>
      loadedComponent.value
        ? h(loadedComponent.value, { ...liveProps.value, ref: previewRef }, liveSlots.value)
        : null;
  },
});

const app = createApp(App);
await setupMuseaApp(app);
app.mount('#app');
