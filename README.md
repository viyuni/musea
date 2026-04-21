<p align="center" style="margin-top: 2rem;">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://assets.viyuni.top/viyuni-musea-light.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://assets.viyuni.top/viyuni-musea-dark.svg">
      <img alt="Viyuni Musea logo" src="https://assets.viyuni.top/viyuni-musea-dark.svg" height="60">
    </picture>
</p>

<h1 align="center">Viyuni Musea</h1>

<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">中文</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@viyuni/musea">
    <img alt="npm version" src="https://img.shields.io/npm/v/%40viyuni%2Fmusea?label=npm" />
  </a>
  <a href="https://github.com/viyuni/musea/actions/workflows/release.yml">
    <img alt="Release status" src="https://github.com/viyuni/musea/actions/workflows/release.yml/badge.svg" />
  </a>
  <a href="https://github.com/viyuni/musea/actions/workflows/ci.yml">
    <img alt="CI status" src="https://github.com/viyuni/musea/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="./LICENSE">
    <img alt="License" src="https://img.shields.io/github/license/viyuni/musea" />
  </a>
  <a href="https://www.npmjs.com/package/@viyuni/musea">
    <img alt="npm downloads" src="https://img.shields.io/npm/dw/%40viyuni%2Fmusea" />
  </a>
</p>

<p align="center">
  <strong> Musea helps you manage component demos, variants, and docs in one place through <code>*.art.vue</code>, with a simple CLI workflow for dev, build, and preview. </strong>
</p>

---

<p align="center" style="margin-top: 2rem;">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./img/image-dark.png">
      <source media="(prefers-color-scheme: light)" srcset="./img/image-light.png">
      <img alt="Viyuni Musea logo" src="./img/image-dark.png"  style="max-width: 50rem;border-radius: 0.5rem;">
    </picture>
</p>

## Installation

```bash
vp add -D @viyuni/musea
```

## Quick Start

Create an `.art.vue` file next to the component you want to showcase.

```vue
<template>
  <art
    title="Button"
    status="ready"
    tags="form,action"
    components="./Button.vue"
    docs="./Button.md"
  >
    <variant name="Default" default>
      <Button>Button</Button>
    </variant>
    <variant name="Disabled">
      <Button disabled>Button</Button>
    </variant>
  </art>
</template>

<script setup lang="ts">
import Button from './Button.vue';
</script>
```

Start the gallery:

```bash
vp exec musea dev
```

Build static output:

```bash
vp exec musea build
```

Preview the built output:

```bash
vp exec musea preview
```

## CLI Commands

Run all commands from project root.

CLI flags override loaded config values when explicitly provided.

| Command                 | Description                                | Available Flags                                    |
| :---------------------- | :----------------------------------------- | :------------------------------------------------- |
| `vp exec musea dev`     | Starts the local development server.       | `--host <host>`, `--port <port>`                   |
| `vp exec musea build`   | Builds the static component gallery.       | `--outDir <dir>`                                   |
| `vp exec musea preview` | Previews the locally built static gallery. | `--outDir <dir>`, `--host <host>`, `--port <port>` |

Notes:

- `musea build ./custom-dir` is intentionally invalid. Use `--outDir`.
- `musea preview` serves existing output and does not build implicitly.

## Configuration

Musea can load config from:

- `musea.config.*`
- `musea` field in `vite.config.*`

Example `musea.config.ts`:

```ts
import { defineConfig } from '@viyuni/musea';

export default defineConfig({
  patterns: ['src/**/*.art.vue'],
  ignore: ['**/node_modules/**', '**/dist/**'],
  setupFile: 'musea.setup.ts',
  sourceMap: true,
  outDir: '.musea',
  port: 3000,
  host: false,
  vite: {},
});
```

Example `vite.config.ts`:

```ts
import { defineConfig } from 'vite-plus';

export default defineConfig({
  musea: {
    patterns: ['src/**/*.art.vue'],
  },
});
```

TypeScript note:

If you configure `musea` in `vite.config.*`, include `@viyuni/musea/macro` in the config TS program:

```json
{
  "compilerOptions": {
    "types": ["@viyuni/musea/macro"]
  }
}
```

## `.art.vue` Contract

`<art>` fields:

- required: `title`, `components`, `status`
- optional: `description`, `docs`, `category`, `tags`, `tests`
- `status` must be one of: `ready`, `wip`, `deprecated`
- `tags` is a comma-separated string
- `components` and `tests` support:
  - string attribute, such as `components="./Button.vue"`
  - bound array, such as `:components='["./Button.vue", "./ButtonIcon.vue"]'`

`<variant>` fields:

- required: `name`
- optional: `default`, `description`

## Build Output

Default build output directory is `.musea`.

Expected output files:

- `.musea/index.html`
- `.musea/frame/variant/index.html`
- `.musea/frame/component/index.html`
- `.musea/assets/*`

## Local Development (Contributing)

This repository uses Vite+:

```bash
vp install
vpr typecheck
vp check
vp pack
vp test
```

## Design References

Musea's product direction and interaction experience are inspired by:

- [Storybook](https://storybook.js.org/)
- [vizejs](https://vizejs.dev/guide/musea/index.html)

For component API docs, Musea uses [`vue-component-meta`](https://github.com/vuejs/language-tools/tree/master/packages/component-meta) to extract metadata (props, events, slots, exposed) from Vue components.

## TODO List

- [ ] Add a Test tab with Vitest integration
- [ ] Add A11y tab
