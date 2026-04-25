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
    /**
     * Art component
     * @example
     * <Art
     *   title="My Art"
     *   description="My Art description"
     *   :components="['./Button.vue']"
     * >
     *   <Variant name="My Variant" description="My Variant description">
     *     <!-- Component Example -->
     *   </Variant>
     * </Art>
     */
    Art: DefineComponent<import('./types/index.ts').ArtProps, {}, {}>;

    /**
     * Variant component
     * @example
     * <Variant name="My Variant" description="My Variant description">
     *   <!-- Component Example -->
     * </Variant>
     */
    Variant: DefineComponent<import('./types/index.ts').VariantProps, {}, {}>;
  }
}

declare module 'vite' {
  interface UserConfig {
    /** Musea config */
    musea?: import('./types/index.ts').MuseaConfig;
  }
}

//@ts-ignore
declare module 'vite-plus' {
  interface UserConfig {
    /** Musea config */ musea?: import('./types/index.ts').MuseaConfig;
  }
}

export {};
