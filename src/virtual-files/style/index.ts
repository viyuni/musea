import { paths } from '../../vite/config.ts';
import { defineVirtualFile } from '../core/index.ts';

export const VIRTUAL_STYLE_ID = 'virtual:musea-style';

export const styleVirtualFile = defineVirtualFile({
  id: VIRTUAL_STYLE_ID,
  load() {
    return `import ${JSON.stringify(paths.styleLink)};`;
  },
});
