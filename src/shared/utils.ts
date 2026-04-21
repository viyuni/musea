import path from 'node:path';

import { normalizePath } from 'unplugin-utils';

export function toRelativePath(file: string, root = process.cwd()) {
  return normalizePath(path.relative(root, file));
}

export function toAbsolutePath(file: string, root = process.cwd()) {
  return normalizePath(path.resolve(root, file));
}

export interface RenderHtmlOptions {
  title: string;
  entryFile: string;
  cssFiles?: string[];
  inlineCss?: string;
}

export function renderHtml({ title, entryFile, cssFiles = [], inlineCss }: RenderHtmlOptions) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <link rel="icon" href="https://assets.viyuni.top/viyuni.svg" />
    ${cssFiles.map((href) => `<link rel="stylesheet" href=${JSON.stringify(href)} />`).join('\n')}
    ${inlineCss ? `<style>${inlineCss}</style>` : ''}
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src=${JSON.stringify(entryFile)}></script>
  </body>
</html>
`;
}
