import { IS_UNPACKED } from '../shared/constants.ts';
import { getFilePath } from './utils.ts';

export const PATHS = IS_UNPACKED
  ? {
      appEntry: '/src/client/app.ts',
      variantFrameEntry: '/src/client/frame-variant.ts',
      componentDebugEntry: '/src/client/frame-debug.ts',
      styleLink: '/src/client/style.css',
    }
  : {
      appEntry: getFilePath('client-app.mjs'),
      variantFrameEntry: getFilePath('client-frame-variant.mjs'),
      componentDebugEntry: getFilePath('client-frame-debug.mjs'),
      styleLink: getFilePath('style.css'),
    };
