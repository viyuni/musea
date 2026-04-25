import { VIRTUAL_ART, VIRTUAL_ART_VARIANT } from '../../../shared/constants.ts';
import { warn } from '../../../shared/logger.ts';
import type { ArtManifest } from '../../../types/index.ts';
import {
  createDefaultExport,
  defineVirtualFile,
  normalizeForImport,
  renderObjectLiteral,
} from '../helpers.ts';

function createVariantRequest(art: ArtManifest, variant?: string) {
  const query = new URLSearchParams({ artId: art.id });

  if (variant) {
    query.set('variant', variant);
  }

  return `${VIRTUAL_ART_VARIANT.id}?${query.toString()}`;
}

function createImportName(prefix: string, index: number) {
  return `${prefix}_${index}`;
}

function renderArtModule(art: ArtManifest, root: string) {
  const primaryComponent = art.components[0];

  if (!primaryComponent) {
    return `throw new Error(${JSON.stringify(`Missing primary component for art id: ${art.id}`)});`;
  }

  const imports: string[] = [];

  const componentImportName = createImportName('component', 0);
  imports.push(
    `import ${componentImportName} from ${JSON.stringify(normalizeForImport(primaryComponent, root))};`,
  );

  const variantEntries = (art.variants ?? []).map((variant, index) => {
    const variantImportName = createImportName('variant', index);
    imports.push(
      `import ${variantImportName} from ${JSON.stringify(createVariantRequest(art, variant.name))};`,
    );
    return `${JSON.stringify(variant.name)}: ${variantImportName}`;
  });

  return [
    ...imports,
    '',
    createDefaultExport(
      renderObjectLiteral([
        `${JSON.stringify(art.id)}: ${renderObjectLiteral([
          `component: ${componentImportName}`,
          `variants: ${renderObjectLiteral(variantEntries)}`,
        ])}`,
      ]),
    ),
  ].join('\n');
}

export const artBundleVirtualFile = defineVirtualFile({
  id: VIRTUAL_ART.id,
  load(ctx) {
    const artId = ctx.searchParams.get('artId');

    if (!artId) {
      warn(`Missing "artId" in ${ctx.requestId}`);
      return 'throw new Error("Missing art id");';
    }

    const art = ctx.artManifest.find((entry) => entry.id === artId);

    if (!art) {
      warn(`Unknown art id: ${artId}`);
      return `throw new Error(${JSON.stringify(`Unknown art id: ${artId}`)});`;
    }

    return renderArtModule(art, ctx.root);
  },
});
