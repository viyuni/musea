import { MUSEA_HOT_EVENTS, VIRTUAL_ART_MANIFEST } from '../../shared/constants.ts';
import { toRelativePath } from '../../shared/utils.ts';
import type { MuseaPluginContext } from '../../types/index.ts';
import { refreshArtManifest } from '../engine/manifest/index.ts';
import type { ArtManifestUpdateEvent } from '../engine/manifest/index.ts';
import { isArtSfc } from '../engine/parser.ts';
import { notifyArtDocsUpdate } from './docs.ts';
import { invalidateVirtualModules } from './utils.ts';

function invalidateManifest(context: MuseaPluginContext) {
  const server = context.devServer;
  if (!server) return;

  // Bust both the bare virtual module and any timestamped re-imports used by the client.
  const manifestModules = Array.from(server.moduleGraph.idToModuleMap.keys()).filter(
    (id) =>
      id === VIRTUAL_ART_MANIFEST.resolvedId ||
      id.startsWith(`${VIRTUAL_ART_MANIFEST.resolvedId}?`),
  );

  invalidateVirtualModules(server, manifestModules);
}

export function notifyManifestUpdate(context: MuseaPluginContext) {
  if (!context.devServer) return;

  invalidateManifest(context);

  context.devServer.ws.send({
    type: 'custom',
    event: MUSEA_HOT_EVENTS.manifestUpdate,
    data: {
      manifest: context.artManifest,
      timestamp: Date.now(),
    },
  });
}

export async function refreshManifestHmr(
  context: MuseaPluginContext,
  file?: string,
  event: ArtManifestUpdateEvent = 'change',
) {
  refreshArtManifest(context, file, event);

  notifyManifestUpdate(context);

  if (file && event !== 'unlink') {
    await notifyArtDocsUpdate(context, toRelativePath(file, context.root), file);
  }
}

export function attachManifestHmr(context: MuseaPluginContext) {
  const onChange = async (file: string, event: ArtManifestUpdateEvent) => {
    if (!isArtSfc(file)) return;

    await refreshManifestHmr(context, file, event);
  };

  context.devServer?.watcher.on('add', (file) => void onChange(file, 'add'));
  context.devServer?.watcher.on('change', (file) => void onChange(file, 'change'));
  context.devServer?.watcher.on('unlink', (file) => void onChange(file, 'unlink'));
}
