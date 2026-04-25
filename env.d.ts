/// <reference types="vite/client" />

declare module 'virtual:musea-manifest' {
  export const manifest: import('./src/types/index.ts').ArtManifest[];
  export const artModules: Record<string, () => Promise<import('virtual:musea-art')>>;
}

declare module 'virtual:musea-art' {
  const artBundle: Record<
    string,
    {
      component: import('vue').Component;
      variants: Record<string, import('vue').Component>;
    }
  >;
  export default artBundle;
}

declare module 'virtual:musea-docs' {
  export const docsModules: Record<
    string,
    () => Promise<typeof import('virtual:musea-docs?artId=*')>
  >;
}

declare module 'virtual:musea-docs?artId=*' {
  export const docs: {
    meta: import('@viyuni/vue-component-meta/types').ResolvedComponentMeta[];
    markdown?: import('vue').Component;
  };
}

declare module 'virtual:musea-config' {
  export const museaConfig: {
    variantRenderMode: import('./src/types/index.ts').VariantRenderMode;
  };
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
