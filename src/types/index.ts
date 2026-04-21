import { ComponentMetaResolver } from '@viyuni/vue-component-meta';
import type { UserConfig, ViteDevServer } from 'vite';
import type { App } from 'vue';

export const artStatuses = ['ready', 'wip', 'deprecated'] as const;

export type ArtStatus = (typeof artStatuses)[number];

export type Awaitable<T> = T | Promise<T>;

export interface MuseaConfig {
  /**
   * Default: all `.art.vue` files under the project root.
   */
  patterns?: string[];

  /**
   * Default: ignore `node_modules` and `dist` folders.
   */
  ignore?: string[];

  /**
   * @default true
   */
  sourceMap?: boolean;

  /**
   * @default tsconfig.json
   */
  tsconfig?: string;

  /**
   * @default .musea
   */
  outDir?: string;

  /**
   * @default musea.setup.ts
   */
  setupFile?: string;

  /**
   * @default 3000
   */
  port?: number;

  host?: string | boolean;

  /**
   * Extra Vite config for the Musea app.
   *
   * User project Vite plugins are not inherited automatically.
   */
  vite?: Omit<UserConfig, 'musea'>;
}

export type MuseaSetup = (app: App) => Awaitable<void>;

export interface ArtProps {
  title: string;
  description?: string;
  components: string[] | string;
  tests?: string[] | string;
  docs?: string;
  category?: string;
  tags?: string;
  status: ArtStatus;
}

export interface ParsedArtProps {
  title: string;
  description?: string;
  components: string[];
  tests: string[];
  docs: string;
  tags: string;
  category?: string;
  status: ArtStatus;
}

export interface VariantProps {
  name: string;
  default?: boolean;
  description?: string;
}

export interface ParsedVariantProps {
  name: string;
  default?: boolean;
  description?: string;
}

export type ArtManifest = Omit<ArtProps, 'docs' | 'tags' | 'components'> & {
  file: string;
  id: string;
  components: string[];
  tests: string[];
  docsFile?: string;
  tags: string[];
  variants?: VariantProps[];
};

export type ArtManifestCache = Map<string, ArtManifest>;

export type MuseaPluginContext = {
  root: string;
  artManifest: ArtManifest[];
  artManifestCache: ArtManifestCache;
  componentMetaResolver?: ComponentMetaResolver;
  devServer?: ViteDevServer;
  options: MuseaConfig;
  setupFile?: string;
  isBuild: boolean;
  addWatchFile?: (file: string) => void;
};

export type VirtualFileRegistryContext = Pick<
  MuseaPluginContext,
  | 'addWatchFile'
  | 'artManifest'
  | 'componentMetaResolver'
  | 'devServer'
  | 'isBuild'
  | 'options'
  | 'root'
  | 'setupFile'
>;

export type VirtualFileContext = {
  requestId: string;
  resolvedId: string;
  searchParams: URLSearchParams;
} & VirtualFileRegistryContext;

export type VirtualFileResolveContext = {
  requestId: string;
  searchParams: URLSearchParams;
} & VirtualFileRegistryContext;

export type VirtualFileResolveId =
  | string
  | ((ctx: VirtualFileResolveContext) => string | undefined);

export type VirtualFileDefinition = {
  id: VirtualFileResolveId;
  matchLoad?: (id: string, searchParams: URLSearchParams) => string | null;
  load: (ctx: VirtualFileContext) => any | Promise<any>;
};
