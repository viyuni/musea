import setupMuseaApp from 'virtual:musea-setup';
import { createApp, defineCustomElement } from 'vue';

import VariantCustomElement from './components/art/Variant.ce.vue';
import Variant from './components/art/Variant.vue';
import { getArtComponent } from './composables/use-art-manifest';

customElements.define('musea-variant', defineCustomElement(VariantCustomElement));

const query = new URLSearchParams(location.search);
const artId = query.get('artId') ?? undefined;

const app = createApp(getArtComponent(artId));
app.component('variant', Variant);
await setupMuseaApp(app);
app.mount('#app');
