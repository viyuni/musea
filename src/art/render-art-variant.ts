import type { ElementNode } from '@vue/compiler-core';
import MagicString from 'magic-string';

import { getDefaultAttributeValue, getNameAttributeValue, parseArtSfc } from './parser.ts';

interface RenderArtVariantOptions {
  filename: string;
  sourceMap: boolean;
  rendererVariant?: string | null;
}

export function renderArtVariant(source: string, options: RenderArtVariantOptions) {
  const { filename, sourceMap, rendererVariant } = options;
  const { artNode, variantNodes } = parseArtSfc(source, filename);

  let rendererVariantNode: ElementNode | undefined;

  if (rendererVariant) {
    // find variant by name
    rendererVariantNode = variantNodes.find(
      (node) => getNameAttributeValue(node) === rendererVariant,
    );
  } else {
    // find default variant
    const defineVariantNodes = variantNodes.find((node) => getDefaultAttributeValue(node));

    // if no default variant, use first variant
    rendererVariantNode = defineVariantNodes ? defineVariantNodes : variantNodes?.[0];
  }

  if (!rendererVariantNode)
    throw new Error(`Variant "${rendererVariant}" not found in ${filename}`);

  const s = new MagicString(source);

  // join all children
  const replacement = rendererVariantNode.children.map((node) => node.loc.source).join('');

  s.overwrite(artNode.loc.start.offset, artNode.loc.end.offset, replacement);

  const map = sourceMap
    ? s.generateMap({
        hires: true,
        source: filename,
        includeContent: true,
      })
    : undefined;

  return {
    code: s.toString(),
    map,
  };
}
