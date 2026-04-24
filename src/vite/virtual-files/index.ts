import { artBundleVirtualFile } from './art/index.ts';
import { artDocsVirtualFile } from './docs/index.ts';
import { artManifestVirtualFile } from './manifest/index.ts';
import { createVirtualFileRegistry } from './registry.ts';
import { setupVirtualFile } from './setup/index.ts';
import { styleVirtualFile } from './style/index.ts';
import { artVariantVirtualFile } from './variant/index.ts';

export const virtualFileRegistry = createVirtualFileRegistry([
  artManifestVirtualFile,
  artBundleVirtualFile,
  artDocsVirtualFile,
  styleVirtualFile,
  artVariantVirtualFile,
  setupVirtualFile,
]);
