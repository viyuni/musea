`Button` is the baseline action component used across the playground.

## When to use

- Trigger a primary user action
- Present a secondary fallback action
- Keep action labels short and clear

## Examples

```vue
<script setup lang="ts">
import Button from './Button.vue';
</script>

<template>
  <Button>Button</Button>
</template>
```

## Props

| Prop    | Type                             | Default     | Description               |
| ------- | -------------------------------- | ----------- | ------------------------- |
| `size`  | `'small' \| 'medium' \| 'large'` | `'medium'`  | Visual size of the button |
| `color` | `'primary' \| 'secondary'`       | `'primary'` | Semantic color style      |

## Events

| Event    | Payload                        | Description            |
| -------- | ------------------------------ | ---------------------- |
| `update` | `(value: number, okk: string)` | Internal update event  |
| `click`  | `(value: number)`              | Click callback payload |

## Variants in this showcase

- `Primary`: main action emphasis
- `Secondary`: lower emphasis alternative
- `Large`: size scaling example

## Testing Notes

This component is linked to:

- `./Button.test.ts`
- `./Button.extra.test.ts`

Both files are smoke-style tests intended to verify import and component metadata stability.
