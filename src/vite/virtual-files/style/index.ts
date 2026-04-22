import { PATHS } from '../../config.ts';
import { defineVirtualFile } from '../helpers.ts';

export const VIRTUAL_STYLE_ID = 'virtual:musea-style';

export const styleVirtualFile = defineVirtualFile({
  id: VIRTUAL_STYLE_ID,
  load() {
    return `import ${JSON.stringify(PATHS.styleLink)};`;
  },
});
