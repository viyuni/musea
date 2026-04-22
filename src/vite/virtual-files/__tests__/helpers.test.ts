import { describe, expect, test } from 'vite-plus/test';

import {
  createConstExport,
  createDefaultExport,
  createImport,
  renderObjectLiteral,
  serializeModuleValue,
} from '../helpers.ts';

describe('virtual file helpers', () => {
  test('renders module snippets', () => {
    const params = new URLSearchParams({ variant: 'primary' });

    expect(createImport('/src/Button.vue', params)).toBe(
      '() => import("/src/Button.vue?variant=primary")',
    );
    expect(serializeModuleValue({ title: 'Button' })).toBe('{\n  "title": "Button"\n}');
    expect(createConstExport('manifest', '[]')).toBe('export const manifest = [];');
    expect(createDefaultExport('{}')).toBe('export default {};');
    expect(renderObjectLiteral(['one: 1', 'two: 2'])).toBe('{\none: 1,\ntwo: 2\n}');
    expect(renderObjectLiteral([])).toBe('{}');
  });
});
