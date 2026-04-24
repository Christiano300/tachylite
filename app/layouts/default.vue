<template>
  <DocsHeader>
    <UBreadcrumb :items="breadcrumb"></UBreadcrumb>
  </DocsHeader>

  <UMain>
    <UContainer>
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
    </UContainer>
  </UMain>
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

const breadcrumb = computed(() => {
  if (!toc.value) return [];
  const pathSegments = getPathSegments(route.path, toc.value);
  if (!pathSegments) return [];
  return pathSegments.map(label => ({ label }));
});

function getPathSegments(url: string, toc: TocTree[], segments: string[] = []): string[] | undefined {
  for (const f of toc) {
    segments.push(f.name);
    if (f.url === url) {
      return segments;
    }
    if (f.children) {
      const result = getPathSegments(url, f.children, segments);
      if (result) {
        return result;
      }
    }
    segments.pop();
  }
}

</script>