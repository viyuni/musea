import { VIRTUAL_ART, VIRTUAL_ART_MANIFEST } from '../../../shared/constants.ts';
import type { ArtManifest } from '../../../types/index.ts';
import {
  createConstExport,
  createImport,
  defineVirtualFile,
  renderObjectLiteral,
  serializeModuleValue,
} from '../helpers.ts';

function renderManifestExport(manifest: ArtManifest[]) {
  return createConstExport('manifest', serializeModuleValue(manifest));
}

function renderArtModulesExport(manifest: ArtManifest[]) {
  return createConstExport(
    'artModules',
    renderObjectLiteral(
      manifest.map((art) => {
        return `${JSON.stringify(art.id)}: ${createImport(
          VIRTUAL_ART.id,
          new URLSearchParams({ artId: art.id }),
        )}`;
      }),
    ),
  );
}

export const artManifestVirtualFile = defineVirtualFile({
  id: VIRTUAL_ART_MANIFEST.id,
  load({ artManifest }) {
    return [renderManifestExport(artManifest), renderArtModulesExport(artManifest)].join('\n\n');
  },
});
