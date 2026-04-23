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
  define?: Record<string, string>;
}

export const resetCss = `html, body { padding: 0; margin: 0; }`;

export function renderHtml({
  title,
  entryFile,
  cssFiles = [],
  inlineCss = resetCss,
  define = {},
}: RenderHtmlOptions) {
  const defineEntries = Object.entries(define);
  const globalScript =
    defineEntries.length > 0
      ? `<script type="module">
${defineEntries
  .map(([name, expression]) => `globalThis[${JSON.stringify(name)}] = ${expression};`)
  .join('\n')}
</script>`
      : '';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <link rel="icon" href="https://assets.viyuni.top/viyuni.svg" />
    ${cssFiles.map((href) => `<link rel="stylesheet" href=${JSON.stringify(href)} />`).join('\n')}
    ${inlineCss ? `<style>${inlineCss}</style>` : ''}
    ${globalScript}
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src=${JSON.stringify(entryFile)}></script>
  </body>
</html>
`;
}
