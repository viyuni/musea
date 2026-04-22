import { artDocsVirtualFile } from './docs/index.ts';
import { artManifestVirtualFile } from './manifest/index.ts';
import { createVirtualFileRegistry } from './registry.ts';
import { artVariantRenderVirtualFile } from './render/index.ts';
import { setupVirtualFile } from './setup/index.ts';
import { styleVirtualFile } from './style/index.ts';

export const virtualFileRegistry = createVirtualFileRegistry([
  artManifestVirtualFile,
  artDocsVirtualFile,
  styleVirtualFile,
  artVariantRenderVirtualFile,
  setupVirtualFile,
]);
