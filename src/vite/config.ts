import { IS_UNPACKED } from '../shared/constants.ts';
import { getFilePath } from './utils.ts';

export const PATHS = IS_UNPACKED
  ? {
      appEntry: '/src/client/app.ts',
      variantFrameEntry: '/src/client/frame-variant.ts',
      componentFrameEntry: '/src/client/frame-component.ts',
      styleLink: '/src/client/style.css',
    }
  : {
      appEntry: getFilePath('client-app.mjs'),
      variantFrameEntry: getFilePath('client-frame-variant.mjs'),
      componentFrameEntry: getFilePath('client-frame-component.mjs'),
      styleLink: getFilePath('style.css'),
    };
