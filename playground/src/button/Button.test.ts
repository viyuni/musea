import { describe, expect, test } from 'vitest';

import Button from './Button.vue';

describe('Button', () => {
  test('can be imported', () => {
    expect(Button).toBeTruthy();
  });

  test('has stable component name', () => {
    expect(Button.name).toBe('Button');
  });
});
