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

function renderArtModulesExport(manifest: ArtManifest[], timestamp?: string | null) {
  return createConstExport(
    'artModules',
    renderObjectLiteral(
      manifest.map((art) => {
        const searchParams = new URLSearchParams({ artId: art.id });

        if (timestamp) {
          searchParams.set('t', timestamp);
        }

        return `${JSON.stringify(art.id)}: ${createImport(VIRTUAL_ART.id, searchParams)}`;
      }),
    ),
  );
}

export const artManifestVirtualFile = defineVirtualFile({
  id: VIRTUAL_ART_MANIFEST.id,
  load({ artManifest, searchParams }) {
    const timestamp = searchParams.get('t');

    return [renderManifestExport(artManifest), renderArtModulesExport(artManifest, timestamp)].join(
      '\n\n',
    );
  },
});
