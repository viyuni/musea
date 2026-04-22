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
  <strong> Musea 通过 <code>*.art.vue</code> 让你在一个地方管理组件示例、变体与文档，并提供简单的 CLI 工作流用于开发、构建和预览。 </strong>
</p>

---

<p align="center" style="margin-top: 2rem;">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./img/image-dark.png">
      <source media="(prefers-color-scheme: light)" srcset="./img/image-light.png">
      <img alt="Viyuni Musea logo" src="./img/image-dark.png"  style="max-width: 50rem;border-radius: 0.5rem;">
    </picture>
</p>

## 安装

```bash
vp add -D @viyuni/musea
```

## 快速开始

在你要展示的组件旁边创建一个 `.art.vue` 文件。

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

启动画廊开发服务：

```bash
vp exec musea dev
```

构建静态产物：

```bash
vp exec musea build
```

预览已构建产物：

```bash
vp exec musea preview
```

## CLI 命令

请在项目根目录执行命令。

当显式传入 CLI 参数时，会覆盖配置文件中的同名配置。

| 命令                    | 说明                     | 可用参数                                           |
| :---------------------- | :----------------------- | :------------------------------------------------- |
| `vp exec musea dev`     | 启动本地开发服务         | `--host <host>`, `--port <port>`                   |
| `vp exec musea build`   | 构建静态组件画廊         | `--outDir <dir>`                                   |
| `vp exec musea preview` | 预览本地构建后的静态画廊 | `--outDir <dir>`, `--host <host>`, `--port <port>` |

说明：

- `musea build ./custom-dir` 是无效用法，请使用 `--outDir`。
- `musea preview` 只会服务已有产物，不会隐式执行构建。

## 配置

Musea 可以从以下位置加载配置：

- `musea.config.*`
- `vite.config.*` 中的 `musea` 字段

`musea.config.ts` 示例：

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

`vite.config.ts` 示例：

```ts
import { defineConfig } from 'vite-plus';

export default defineConfig({
  musea: {
    patterns: ['src/**/*.art.vue'],
  },
});
```

### Setup 文件（`musea.setup.*`）

Musea 会自动检测项目根目录下的 `musea.setup.*`（例如 `musea.setup.ts`），并在画廊预览应用挂载前执行它。

这个文件适合放置在 variant/component frame 中共享的全局初始化逻辑，例如注册插件、全局组件、指令，或 `provide` 全局依赖。

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

如果项目中没有 `musea.setup.*` 文件，Musea 会使用默认的空初始化函数。

TypeScript 提示：

如果你在 `vite.config.*` 中配置 `musea`，请在该配置对应的 TS Program 中加入 `@viyuni/musea/macro`：

```json
{
  "compilerOptions": {
    "types": ["@viyuni/musea/macro"]
  }
}
```

## `.art.vue` 约定

`<art>` 字段：

- 必填：`title`、`components`、`status`
- 可选：`description`、`docs`、`category`、`tags`、`tests`
- `status` 可选值：`ready`、`wip`、`deprecated`
- `tags` 为逗号分隔字符串
- `components` 与 `tests` 支持：
  - 字符串属性：`components="./Button.vue"`
  - 绑定数组：`:components='["./Button.vue", "./ButtonIcon.vue"]'`

`<variant>` 字段：

- 必填：`name`
- 可选：`default`、`description`

## 构建产物

默认输出目录为 `.musea`。

预期产物包括：

- `.musea/index.html`
- `.musea/frame/variant/index.html`
- `.musea/frame/component/index.html`
- `.musea/assets/*`

## 本地开发（贡献）

本仓库使用 Vite+：

```bash
vp install
vpr typecheck
vp check
vp pack
vp test
```

## 设计参考

Musea 的产品方向与交互体验参考了：

- [Storybook](https://storybook.js.org/)
- [vizejs](https://vizejs.dev/guide/musea/index.html)

组件 API 文档由 [`vue-component-meta`](https://github.com/vuejs/language-tools/tree/master/packages/component-meta) 自动提取（props、events、slots、exposed）。

## 能力边界与路线图

为避免预期偏差，下面列出 Musea 当前已支持能力与计划能力。

### 当前已支持

- 通过 `*.art.vue` 生成组件画廊（含 `variant` 维度）
- CLI 工作流：`musea dev` / `musea build` / `musea preview`
- 基于组件元信息生成 API 文档（`vue-component-meta`）
- `musea.setup.*` 全局初始化扩展（插件、全局组件、指令、provide 等）
- 固定核心路由与 frame 预览能力（`/`、`/frame/variant`、`/frame/component`）

### 计划能力（Roadmap）

- [ ] 添加 Test tab，并集成 Vitest
- [ ] 添加 A11y tab
- [ ] 允许关闭自动生成文档
- [ ] 允许添加自定义页面
- [ ] 允许自定义 `title` 和 `logo`
- [ ] 允许修改路由
- [ ] 优化Musea静态构建产物
