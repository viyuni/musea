import { VIRTUAL_ART_MANIFEST } from '../../../shared/constants.ts';
import type { ArtManifest } from '../../../types/index.ts';
import {
  createConstExport,
  createImport,
  defineVirtualFile,
  normalizeForImport,
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
      manifest.map(
        (art) => `${JSON.stringify(art.id)}: ${createImport(normalizeForImport(art.file))}`,
      ),
    ),
  );
}

function renderComponentModulesExport(manifest: ArtManifest[], root: string) {
  return createConstExport(
    'componentModules',
    renderObjectLiteral(
      manifest.map((art) => {
        const primaryComponent = art.components[0];

        if (!primaryComponent) {
          return `${JSON.stringify(art.id)}: () => Promise.reject(new Error(${JSON.stringify(
            `Missing primary component for art id: ${art.id}`,
          )}))`;
        }

        return `${JSON.stringify(art.id)}: ${createImport(normalizeForImport(primaryComponent, root))}`;
      }),
    ),
  );
}

export const artManifestVirtualFile = defineVirtualFile({
  id: VIRTUAL_ART_MANIFEST.id,
  load({ artManifest, root }) {
    return [
      renderManifestExport(artManifest),
      renderArtModulesExport(artManifest),
      renderComponentModulesExport(artManifest, root),
    ].join('\n\n');
  },
});
