import type { MuseaPluginContext } from '../../types/index.ts';
import { attachDocsHmr } from './docs.ts';
import { attachManifestHmr } from './manifest.ts';
export { handleMuseaDocsHotUpdate } from './docs.ts';

export function attachMuseaHmr(context: MuseaPluginContext) {
  attachDocsHmr(context);
  attachManifestHmr(context);
}
