import type { ResolvedProp } from '@viyuni/vue-component-meta/types';
import { watchEffect, type Ref } from 'vue';

export function useSchemaFormPropsModel(
  resolvedProps: Ref<ResolvedProp[] | undefined>,
  propValues: Ref<Record<string, unknown>>,
) {
  function getPropValue(name: string) {
    return propValues.value[name];
  }

  function setPropValue(name: string, value: unknown) {
    const next = { ...propValues.value };

    if (value === undefined) {
      delete next[name];
    } else {
      next[name] = value;
    }

    propValues.value = next;
  }

  watchEffect(() => {
    const next = { ...propValues.value };
    let changed = false;

    for (const prop of resolvedProps.value ?? []) {
      if (!(prop.name in next) && prop.default !== undefined) {
        next[prop.name] = prop.default;
        changed = true;
      }
    }

    if (changed) {
      propValues.value = next;
    }
  });

  return {
    getPropValue,
    setPropValue,
  };
}
