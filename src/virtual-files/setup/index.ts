import { defineVirtualFile, js, normalizeForImport } from '../core/index.ts';

export const VIRTUAL_SETUP_ID = 'virtual:musea-setup';

function renderSetupModule(setupFile?: string, root = process.cwd()) {
  if (setupFile) {
    return js`
// VIRTUAL FILE START

import setup from ${JSON.stringify(normalizeForImport(setupFile, root))};

export default setup;

// VIRTUAL FILE EMD
`;
  }

  return js`
// VIRTUAL FILE START

async function setup() {}

export default setup;

// VIRTUAL FILE EMD
`;
}

export const setupVirtualFile = defineVirtualFile({
  id: VIRTUAL_SETUP_ID,
  load({ setupFile, root }) {
    return renderSetupModule(setupFile, root);
  },
});
