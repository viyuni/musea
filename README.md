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
  <a href="https://pkg.pr.new/~/viyuni/musea">
    <img alt="pkg.pr.new" src="https://pkg.pr.new/badge/viyuni/musea" />
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

## PR Preview Packages

This repository publishes preview packages for every pull request via `pkg.pr.new`.

- Open: `https://pkg.pr.new/~/viyuni/musea`
- Install a specific PR/commit package from the generated URL in the PR check/comment.

## Quick Start

Create an `.art.vue` file next to the component you want to showcase.

```vue
<template>
  <art
    title="Button"
    status="ready"
    tags="form,action"
    components="./Button.vue"
    <!-- :components="['./Button.vue']" -->
    docs="./Button.md"
  >
    <variant name="Default">
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

### Setup File (`musea.setup.*`)

Musea auto-detects `musea.setup.*` in project root (for example `musea.setup.ts`) and runs it before mounting gallery preview apps.

Use this file for global app setup shared by variant/component frames, such as registering plugins, global components, directives, or `provide` values.

```ts
import { defineSetup } from '@viyuni/musea';
import type { App } from 'vue';

export default defineSetup((app: App) => {
  // app.use(...)
  // app.component(...)
  // app.directive(...)
  // app.provide(...)
});
```

If no `musea.setup.*` file exists, Musea uses a no-op setup by default.

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

## Capability Boundaries And Roadmap

To avoid expectation gaps, the sections below clarify what Musea supports today and what is planned next.

### Currently Supported

- Generate a component gallery from `*.art.vue` files (including `variant` dimensions)
- CLI workflow: `musea dev` / `musea build` / `musea preview`
- API docs generation from component metadata (`vue-component-meta`)
- Global setup via `musea.setup.*` (plugins, global components, directives, provide, etc.)
- Fixed core routes and frame previews (`/`, `/frame/variant`, `/frame/component`)

### Planned Capabilities (Roadmap)

- [ ] Add a Test tab with Vitest integration
- [ ] Add an A11y tab
- [ ] Allow disabling automatic docs generation
- [ ] Allow adding custom pages
- [ ] Allow custom `title` and `logo`
- [ ] Allow route customization
- [ ] Optimize Musea static build output artifacts
