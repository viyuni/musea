import { describe, expect, test } from 'vite-plus/test';

import {
  collectAttributes,
  getDefaultAttributeValue,
  getNameAttributeValue,
  parseArtSfc,
} from '../parser.ts';

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
    default="false"
  >
    <Variant name="primary" default />
    <Variant name="secondary" default="false" />
  </Art>
</template>
`,
      'Button.art.vue',
    );

    expect(collectAttributes(artNode)).toMatchObject({
      title: 'Button',
      component: './MuseaButton.vue',
      category: 'Inputs',
      status: 'ready',
      tags: 'form, action',
      default: false,
    });
    expect(variantNodes).toHaveLength(2);
    expect(getNameAttributeValue(variantNodes[0]!)).toBe('primary');
    expect(getDefaultAttributeValue(variantNodes[0]!)).toBe(true);
    expect(getDefaultAttributeValue(variantNodes[1]!)).toBe(false);
  });

  test('supports components attribute and :components directive', () => {
    const fromAttribute = parseArtSfc(
      `
<template>
  <Art title="Button" components="./MuseaButton.vue" status="ready" />
</template>
`,
      'Button.art.vue',
    );

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
    );

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
    );

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
    );

    expect(collectAttributes(fromDirective.artNode)).toMatchObject({
      title: 'Button',
      tests: ['./Button.test.ts', './Button.a11y.test.ts'],
      status: 'ready',
    });
  });

  test('throws when template or art root is missing', () => {
    expect(() => parseArtSfc('<script setup></script>', 'MissingTemplate.art.vue')).toThrow(
      'Missing template in MissingTemplate.art.vue',
    );
    expect(() => parseArtSfc('<template><div /></template>', 'MissingArt.art.vue')).toThrow(
      'Missing <art> root in MissingArt.art.vue',
    );
  });
});
