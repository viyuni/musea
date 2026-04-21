import { stat } from 'node:fs/promises';
import path from 'node:path';

import { type EventHandlerRequest, getQuery, H3, H3Event, html, HTTPError } from 'h3';
import { toNodeHandler } from 'h3/node';
import launchEditor from 'launch-editor';
import type { Connect } from 'vite';

import { ROUTES } from '../shared/constants.ts';
import { renderHtml, type RenderHtmlOptions } from '../shared/utils.ts';
import type { MuseaPluginContext } from '../types/index.ts';
import { paths } from './config.ts';

const routePaths = Object.values(ROUTES);

function shouldHandleMuseaRequest(url: string | undefined) {
  const pathname = new URL(url ?? ROUTES.base, 'http://musea.local').pathname;

  return (
    pathname === ROUTES.base ||
    routePaths.some((route) => pathname === route || pathname === `${route}/`)
  );
}

async function transformIndexHtml(
  options: {
    event: H3Event<EventHandlerRequest>;
    ctx: MuseaPluginContext;
  } & RenderHtmlOptions,
) {
  const { ctx, event, ...reset } = options;

  if (!ctx.devServer) {
    throw new HTTPError('Musea dev server is not ready', { status: 500 });
  }

  const content = await ctx.devServer.transformIndexHtml(event.url.href, renderHtml(reset));
  return html(content);
}

export function museaServer(ctx: MuseaPluginContext): Connect.NextHandleFunction {
  const app = new H3();

  app.get(ROUTES.base, (event) => {
    return transformIndexHtml({
      event,
      ctx,
      title: 'Musea',
      entryFile: paths.appEntry,
      cssFiles: [paths.styleLink],
    });
  });

  app.get(ROUTES.frameVariant, (event) => {
    return transformIndexHtml({
      event,
      ctx,
      title: 'Musea Variant Preview',
      entryFile: paths.variantFrameEntry,
    });
  });

  app.get(ROUTES.frameComponent, async (event) => {
    return transformIndexHtml({
      event,
      ctx,
      title: 'Musea Component Preview',
      entryFile: paths.componentFrameEntry,
    });
  });

  app.get(ROUTES.openInEditor, async (event) => {
    const { file } = getQuery(event);

    if (!file) {
      throw new HTTPError('Missing file query', { status: 400 });
    }

    try {
      await stat(path.resolve(process.cwd(), file));
    } catch {
      throw new HTTPError('File not found', { status: 404 });
    }

    launchEditor(file, 'code');
  });

  const handler = toNodeHandler(app);

  return (req, res, next) => {
    if (!shouldHandleMuseaRequest(req.url)) {
      return next();
    }

    return handler(req, res);
  };
}
