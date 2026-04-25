import { describe, expect, test, vi } from 'vite-plus/test';

import { collectAttributes, getNameAttributeValue, parseArtSfc } from '../parser.ts';

describe('parseArtSfc', () => {
  test('collects art root and direct variant nodes', () => {
    const { artNode, variantNodes } = parseArtSfc(
      `
<template>
  <Art
    title="Button"
    component="./MuseaButton.vue"
    category="Inputs"
    status="ready"
    tags="form, action"
  >
    <Variant name="primary" />
    <Variant name="secondary" />
  </Art>
</template>
`,
      'Button.art.vue',
    )!;

    expect(collectAttributes(artNode)).toMatchObject({
      title: 'Button',
      component: './MuseaButton.vue',
      category: 'Inputs',
      status: 'ready',
      tags: 'form, action',
    });
    expect(variantNodes).toHaveLength(2);
    expect(getNameAttributeValue(variantNodes[0]!)).toBe('primary');
    expect(getNameAttributeValue(variantNodes[1]!)).toBe('secondary');
  });

  test('supports components attribute and :components directive', () => {
    const fromAttribute = parseArtSfc(
      `
<template>
  <Art title="Button" components="./MuseaButton.vue" status="ready" />
</template>
`,
      'Button.art.vue',
    )!;

    expect(collectAttributes(fromAttribute.artNode)).toMatchObject({
      title: 'Button',
      components: ['./MuseaButton.vue'],
      tests: [],
      status: 'ready',
    });

    const fromDirective = parseArtSfc(
      `
<template>
  <Art title="Button" :components='["./MuseaButton.vue", "./MuseaButtonIcon.vue"]' status="ready" />
</template>
`,
      'Button.art.vue',
    )!;

    expect(collectAttributes(fromDirective.artNode)).toMatchObject({
      title: 'Button',
      components: ['./MuseaButton.vue', './MuseaButtonIcon.vue'],
      tests: [],
      status: 'ready',
    });
  });

  test('supports tests attribute and :tests directive', () => {
    const fromAttribute = parseArtSfc(
      `
<template>
  <Art title="Button" components="./MuseaButton.vue" tests="./Button.test.ts" status="ready" />
</template>
`,
      'Button.art.vue',
    )!;

    expect(collectAttributes(fromAttribute.artNode)).toMatchObject({
      title: 'Button',
      tests: ['./Button.test.ts'],
      status: 'ready',
    });

    const fromDirective = parseArtSfc(
      `
<template>
  <Art title="Button" components="./MuseaButton.vue" :tests='["./Button.test.ts", "./Button.a11y.test.ts"]' status="ready" />
</template>
`,
      'Button.art.vue',
    )!;

    expect(collectAttributes(fromDirective.artNode)).toMatchObject({
      title: 'Button',
      tests: ['./Button.test.ts', './Button.a11y.test.ts'],
      status: 'ready',
    });
  });

  test('warns and returns undefined when template or art root is missing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(parseArtSfc('<script setup></script>', 'MissingTemplate.art.vue')).toBeUndefined();
    expect(parseArtSfc('<template><div /></template>', 'MissingArt.art.vue')).toBeUndefined();

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Missing template in MissingTemplate.art.vue'),
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Missing <art> root in MissingArt.art.vue'),
    );
    warn.mockRestore();
  });
});
