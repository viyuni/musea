import { describe, expect, test, vi } from 'vite-plus/test';

import { renderArtVariant } from '../render-art-variant.ts';

const source = `
<template>
  <Art title="Button" status="ready">
    <Variant name="primary">
      <button>Primary</button>
    </Variant>
    <Variant name="secondary" default>
      <button>Secondary</button>
    </Variant>
  </Art>
</template>
`;

describe('renderArtVariant', () => {
  test('renders named variant when rendererVariant is provided', () => {
    const result = renderArtVariant(source, {
      filename: 'Button.art.vue',
      sourceMap: false,
      rendererVariant: 'primary',
    });

    expect(result.code).toContain('<button>Primary</button>');
    expect(result.code).not.toContain('<button>Secondary</button>');
    expect(result.map).toBeUndefined();
  });

  test('uses default variant when rendererVariant is missing', () => {
    const result = renderArtVariant(source, {
      filename: 'Button.art.vue',
      sourceMap: false,
    });

    expect(result.code).toContain('<button>Secondary</button>');
    expect(result.code).not.toContain('<button>Primary</button>');
  });

  test('falls back to source and warns when variant is not found', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = renderArtVariant(source, {
      filename: 'Button.art.vue',
      sourceMap: true,
      rendererVariant: 'ghost',
    });

    expect(result.code).toBe(source);
    expect(result.map).toBeUndefined();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Variant "ghost" not found'));
    warn.mockRestore();
  });
});
