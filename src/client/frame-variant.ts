import setupMuseaApp from 'virtual:musea-setup';
import { createApp } from 'vue';

import { loadVariantComponent } from './features/art/composables/use-art-manifest';

const query = new URLSearchParams(location.search);
const artId = query.get('artId') ?? '';
const variant = query.get('variant') ?? '';

const Variant = loadVariantComponent(artId, variant);

const app = createApp(Variant);
await setupMuseaApp(app);
app.mount('#musea-app');
