import 'vite';
import 'vue';

type DefineComponent<P = {}, S = {}, E = {}, M = {}> = {
  new (): {
    $props: P;
    $slots: S;
    $emit: E;
  } & M;
};

declare module 'vue' {
  export interface GlobalComponents {
    Art: DefineComponent<import('./types/index.ts').ArtProps, {}, {}>;
    Variant: DefineComponent<import('./types/index.ts').VariantProps, {}, {}>;
  }
}

declare module 'vite' {
  interface UserConfig {
    musea?: import('./types/index.ts').MuseaConfig;
  }
}

declare module 'vite-plus' {
  interface UserConfig {
    musea?: import('./types/index.ts').MuseaConfig;
  }
}

export {};
