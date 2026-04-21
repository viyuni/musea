import setupMuseaApp from 'virtual:musea-setup';
import { createApp } from 'vue';

import { getVariantComponent } from './composables/use-art-manifest';
import { useInspector } from './composables/use-inspector';

const query = new URLSearchParams(location.search);
const artId = query.get('artId') ?? '';
const variant = query.get('variant') ?? '';

const Variant = getVariantComponent(artId, variant);

useInspector();

const app = createApp(Variant);
await setupMuseaApp(app);
app.mount('#app');
