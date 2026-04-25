import { VIRTUAL_MUSEA_CONFIG } from '../../../shared/constants.ts';
import { defineVirtualFile, serializeModuleValue } from '../helpers.ts';

export const museaConfigVirtualFile = defineVirtualFile({
  id: VIRTUAL_MUSEA_CONFIG.id,
  load({ options }) {
    return `export const museaConfig = ${serializeModuleValue({
      variantRenderMode: options.variantRenderMode,
    })}`;
  },
});
