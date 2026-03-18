<template>
  <UPage>
    <template #left>
      <UPageAside>
        <UTree :items="items"></UTree>
      </UPageAside>
    </template>
    <UPageBody>
      <div v-if="data && data.html" class="prose prose-invert max-w-none" v-html="data.html"></div>
    </UPageBody>
  </UPage>
</template>

<script lang="ts" setup>
import type { TocTree } from "~~/shared/types";
import type { TreeItem } from "@nuxt/ui";

const route = useRoute();

const page = Array.isArray(route.params.slug) ? route.params.slug.join("/") : route.params.slug;

const { data, error } = useFetch(`/api/content`, {
  query: { path: encodeURIComponent(page as string), mount: route.params.mount },
});

const { data: toc } = useFetch<TocTree[]>(`/api/toc/${route.params.mount}`);

const items = computed(() => {
  if (!toc.value) return [];
  const value = structuredClone(toc.value);
  const transform = (node: TreeItem & TocTree) => {
    node.label = node.name;
    node.children?.forEach(transform);
  };
  value.forEach(transform);
  return value;
});
</script>

<style></style>
