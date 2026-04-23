/// <reference types="vite/client" />

declare module 'virtual:musea-manifest' {
  export const manifest: import('./src/types/index.ts').ArtManifest[];
  export const artModules: Record<string, () => Promise<import('vue').Component>>;
  export const componentModules: Record<string, () => Promise<import('vue').Component>>;
}

declare module 'virtual:musea-docs' {
  export const docsModules: Record<
    string,
    () => Promise<{ docs: import('./src/types/index.ts').ArtDocs }>
  >;
  export const markdownDocsModules: Record<string, () => Promise<import('vue').Component>>;
}

declare module 'virtual:musea-docs?artId=*' {
  export const docs: import('./src/types/index.ts').ArtDocs;
}

declare module 'virtual:musea-frame' {}

declare module 'virtual:musea-style' {}

declare module 'virtual:musea-setup' {
  export default function (app: import('vue').App): Promise<void>;
}

declare module '*?raw' {
  const content: string;
  export default content;
}

declare module 'markdown-it-task-lists' {
  const taskLists: import('markdown-exit').PluginSimple;
  export default taskLists;
}
