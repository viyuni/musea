import type { VueInspectorClient } from 'vite-plugin-vue-inspector';

import { isInspectorMessage } from '../messages/preview';

declare global {
  interface Window {
    __VUE_INSPECTOR__?: VueInspectorClient;
  }
}

const inspector: VueInspectorClient | undefined = window.__VUE_INSPECTOR__;

export function useInspector() {
  if (!inspector) return;

  inspector.openInEditor = (url) => {
    inspector.disable();
    fetch(url);
  };

  window.addEventListener('message', (message) => {
    if (isInspectorMessage(message.data)) {
      inspector.toggleEnabled();
    }
  });
}
