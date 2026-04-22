import { defineVirtualFile, normalizeForImport } from '../helpers.ts';

export const VIRTUAL_SETUP_ID = 'virtual:musea-setup';

function renderSetupModule(setupFile?: string, root = process.cwd()) {
  if (setupFile) {
    return `
import setup from ${JSON.stringify(normalizeForImport(setupFile, root))};

export default setup;
`;
  }

  return `
async function setup() {}

export default setup;
`;
}

export const setupVirtualFile = defineVirtualFile({
  id: VIRTUAL_SETUP_ID,
  load({ setupFile, root }) {
    return renderSetupModule(setupFile, root);
  },
});
