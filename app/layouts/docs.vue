<template>
  <DocsHeader>
    <UBreadcrumb :items="breadcrumb"></UBreadcrumb>
  </DocsHeader>

  <UMain>
    <UContainer>
      <UPage v-if="toc">
        <template #left>
          <UPageAside id="page-aside">
            <UTree :items="items" :get-key="item => item.url" v-model="current">
              <template #item-label="{ item }">
                <NuxtLink :to="item.url" class="block w-full h-full" active-class="font-bold">
                  {{ item.label }}
                </NuxtLink>
              </template>
            </UTree>
          </UPageAside>
        </template>
        <UPageBody>
          <slot />
        </UPageBody>
      </UPage>
    </UContainer>
  </UMain>
</template>

<script lang="ts" setup>
import type { TreeItem } from "@nuxt/ui";
import type { TocTree } from "~~/shared/types";
const route = useRoute();
const headers = useRequestHeaders(["authorization"]);

const { data: toc } = await useFetch<TocTree[]>(`/api/toc/${route.params.mount}`, {
  headers,
});

const items = computed(() => {
  if (!toc.value) return [];
  const value = structuredClone(toc.value) as Array<TreeItem & TocTree>;
  const transform = (node: TreeItem & TocTree) => {
    node.label = node.name;
    node.children?.forEach(transform);
    node.onSelect = () => {
      if (node.url) navigateTo(node.url);
    };
    node.defaultExpanded = node.children && node.children.length > 0 && route.path.startsWith(node.url);
  };
  value.forEach(transform);
  return value;
});

const current = computed(() => {
  let current: (TocTree & TreeItem) | undefined = undefined;
  const walk = (node: TocTree) => {
    if (node.url === route.path) {
      current = node;
      return;
    }
    node.children?.forEach(walk);
  }
  items.value?.forEach(walk);
  return current;
});

const breadcrumb = computed(() => {
  if (!toc.value) return [];
  const pathSegments = getPathSegments(route.path, toc.value);
  if (!pathSegments) return [];
  return pathSegments.map((label) => ({ label }));
});

function getPathSegments(
  url: string,
  toc: TocTree[],
  segments: string[] = [],
): string[] | undefined {
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

<style>
#page-aside {
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-color);
}
</style>