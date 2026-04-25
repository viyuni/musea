import type { ElementNode } from '@vue/compiler-core';
import MagicString from 'magic-string';

import { warn } from '../../shared/logger.ts';
import { getNameAttributeValue, parseArtSfc } from './parser.ts';

interface RenderArtVariantOptions {
  filename: string;
  sourceMap: boolean;
  rendererVariant?: string | null;
}

export function renderArtVariant(source: string, options: RenderArtVariantOptions) {
  const { filename, sourceMap, rendererVariant } = options;
  const parsed = parseArtSfc(source, filename);

  if (!parsed) {
    return {
      code: source,
      map: undefined,
    };
  }

  const { artNode, variantNodes } = parsed;

  let rendererVariantNode: ElementNode | undefined;

  if (rendererVariant) {
    // find variant by name
    rendererVariantNode = variantNodes.find(
      (node) => getNameAttributeValue(node) === rendererVariant,
    );
  } else {
    rendererVariantNode = variantNodes[0];
  }

  if (!rendererVariantNode) {
    warn(`Variant "${rendererVariant}" not found in ${filename}`);
    return {
      code: source,
      map: undefined,
    };
  }

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
