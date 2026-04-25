import { defineConfig } from '@viyuni/musea';

export default defineConfig({
  port: 3600,
  host: true,
  tsconfig: 'tsconfig.app.json',
  variantRenderMode: 'inline',
});
