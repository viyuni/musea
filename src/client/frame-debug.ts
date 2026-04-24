import setupMuseaApp from 'virtual:musea-setup';
import { createApp, defineComponent, h } from 'vue';

import { useDebugFrame } from './features/debug/composables/use-debug-frame.ts';

const query = new URLSearchParams(location.search);
const artId = query.get('artId') ?? '';
const initialProps = JSON.parse(query.get('props') ?? '{}');

const App = defineComponent({
  name: 'InterceptedComponentPreview',
  setup() {
    const { loadedComponent, liveProps, liveSlots, previewRef } = useDebugFrame({
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
app.mount('#musea-app');
