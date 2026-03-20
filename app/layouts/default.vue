<template>
  <UPage>
    <template #left>
      <UPageAside>
        <UTree :items="items"></UTree>
      </UPageAside>
    </template>
    <UPageBody>
      <slot></slot>
    </UPageBody>
  </UPage>
</template>

<script lang="ts" setup>
import type { TreeItem } from '@nuxt/ui';
import type { TocTree } from '~~/shared/types';
const route = useRoute();

const { data: toc } = useFetch<TocTree[]>(`/api/toc/${route.params.mount}`);

const items = computed(() => {
  if (!toc.value) return [];
  const value = structuredClone(toc.value);
  const transform = (node: TreeItem & TocTree) => {
    node.label = node.name;
    node.children?.forEach(transform);
    node.onSelect = () => {
      if (node.url) navigateTo(node.url);
    };
  };
  value.forEach(transform);
  return value;
});
</script>