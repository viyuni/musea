import { describe, expect, test } from 'vitest';

import Button from './Button.vue';

describe('Button (extra)', () => {
  test('has a component options object', () => {
    expect(Button).toBeTypeOf('object');
  });

  test('keeps default component name', () => {
    expect(Button.name).toBe('Button');
  });
});
