import type { HmrContext, ModuleNode, ViteDevServer } from 'vite';

import { MUSEA_HOT_EVENTS, VIRTUAL_DOCS } from '../../shared/constants.ts';
import { toAbsolutePath } from '../../shared/utils.ts';
import type { MuseaPluginContext } from '../../types/index.ts';
import { refreshArtManifest } from '../engine/manifest/index.ts';
import { resolveArtDocsTarget } from '../engine/manifest/metadata.ts';
import { notifyManifestUpdate } from './manifest.ts';
import { invalidateVirtualModules } from './utils.ts';

const MAX_MODULE_GRAPH_DEPTH = 32;
const affectedArtIdsByFile = new Map<string, string[]>();

export function getAffectedArtIds(ctx: HmrContext, context: MuseaPluginContext): string[] {
  const affectedIds = new Set<string>();
  const changedFile = toAbsolutePath(ctx.file, context.root);

  if (ctx.modules.length === 0) {
    return affectedArtIdsByFile.get(changedFile) ?? [];
  }

  for (const art of context.artManifest) {
    const componentFiles = art.components.map((f) => toAbsolutePath(f, context.root));

    if (componentFiles.includes(changedFile)) {
      affectedIds.add(art.id);
      continue;
    }

    for (const moduleNode of ctx.modules) {
      if (moduleNodeAffectsFiles(moduleNode, componentFiles)) {
        affectedIds.add(art.id);
        break;
      }
    }
  }

  const ids = Array.from(affectedIds);

  if (ids.length > 0) {
    affectedArtIdsByFile.set(changedFile, ids);
  }

  return ids;
}

function moduleNodeAffectsFiles(
  moduleNode: ModuleNode,
  targetFiles: string[],
  seen = new Set<ModuleNode>(),
  depth = 0,
): boolean {
  if (seen.has(moduleNode) || depth > MAX_MODULE_GRAPH_DEPTH) return false;
  seen.add(moduleNode);

  if (moduleNodeMatchesFiles(moduleNode, targetFiles)) {
    return true;
  }

  const nextModules = new Set([...moduleNode.importers, ...moduleNode.acceptedHmrDeps]);

  return Array.from(nextModules).some((nextModule) =>
    moduleNodeAffectsFiles(nextModule, targetFiles, seen, depth + 1),
  );
}

function moduleNodeMatchesFiles(moduleNode: ModuleNode, targetFiles: string[]) {
  const candidates = [moduleNode.file, moduleNode.id, moduleNode.url].filter(
    (value): value is string => Boolean(value),
  );

  return candidates.some((candidate) => {
    const cleanCandidate = candidate.replace(/[#?].*$/, '');

    return targetFiles.includes(toAbsolutePath(cleanCandidate));
  });
}

function getDocsModuleIdsByArtIds(artIds: string[]) {
  return artIds.map((id) => VIRTUAL_DOCS.resolvedId + `?artId=${encodeURIComponent(id)}`);
}

function getAllDocsModuleIds(server: ViteDevServer) {
  return Array.from(server.moduleGraph.idToModuleMap.keys()).filter(
    (id) => id === VIRTUAL_DOCS.resolvedId || id.startsWith(`${VIRTUAL_DOCS.resolvedId}?`),
  );
}

function invalidateDocsModules(context: MuseaPluginContext, artIds: string[]) {
  const server = context.devServer;
  if (!server) return;

  const docsModules = new Set([
    ...getAllDocsModuleIds(server),
    ...getDocsModuleIdsByArtIds(artIds),
  ]);

  invalidateVirtualModules(server, Array.from(docsModules));
}

function getAffectedArtIdsByMarkdownFile(file: string, context: MuseaPluginContext) {
  const absoluteFile = toAbsolutePath(file, context.root);
  const affectedIds = new Set<string>();

  for (const art of context.artManifest) {
    if (art.docsFile && toAbsolutePath(art.docsFile, context.root) === absoluteFile) {
      affectedIds.add(art.id);
      continue;
    }

    const artFile = toAbsolutePath(art.file, context.root);
    const docsTarget = toAbsolutePath(resolveArtDocsTarget(artFile, context.root), context.root);

    if (docsTarget === absoluteFile) {
      affectedIds.add(art.id);
    }
  }

  return Array.from(affectedIds);
}

async function notifyDocsUpdate(
  context: MuseaPluginContext,
  affectedArtIds: string[],
  file: string,
) {
  if (!context.devServer) return;

  invalidateDocsModules(context, affectedArtIds);

  context.devServer.ws.send({
    type: 'custom',
    event: MUSEA_HOT_EVENTS.docsUpdate,
    data: {
      timestamp: Date.now(),
      affectedArtIds,
      file,
    },
  });
}

export async function notifyArtDocsUpdate(
  context: MuseaPluginContext,
  artId: string,
  file: string,
) {
  await notifyDocsUpdate(context, [artId], file);
}

export async function handleMuseaDocsHotUpdate(
  hmrContext: HmrContext,
  context: MuseaPluginContext,
) {
  const server = context.devServer;

  if (!server) {
    return;
  }

  const affectedArtIds = getAffectedArtIds(hmrContext, context);

  if (affectedArtIds.length === 0) {
    return hmrContext.modules;
  }

  context.componentMetaResolver?.updateFile(hmrContext.file, await hmrContext.read());
  invalidateDocsModules(context, affectedArtIds);

  server.ws.send({
    type: 'custom',
    event: MUSEA_HOT_EVENTS.docsUpdate,
    data: {
      timestamp: Date.now(),
      affectedArtIds,
    },
  });

  return hmrContext.modules;
}

function isMarkdownFile(file: string) {
  return file.endsWith('.md');
}

export function attachDocsHmr(context: MuseaPluginContext) {
  const onChange = async (file: string, event: 'add' | 'change' | 'unlink') => {
    if (!isMarkdownFile(file)) return;

    const affectedArtIds = getAffectedArtIdsByMarkdownFile(file, context);

    if (affectedArtIds.length === 0) {
      return;
    }

    if (event !== 'change') {
      refreshArtManifest(context);
      notifyManifestUpdate(context);
    }

    await notifyDocsUpdate(context, affectedArtIds, file);
  };

  context.devServer?.watcher.on('add', (file) => void onChange(file, 'add'));
  context.devServer?.watcher.on('change', (file) => void onChange(file, 'change'));
  context.devServer?.watcher.on('unlink', (file) => void onChange(file, 'unlink'));
}
