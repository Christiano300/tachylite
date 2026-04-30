<template>
  <div class="max-w-5xl w-full flow-root">
    <div v-if="data && data.html" class="prose prose-invert max-w-none w-full" v-html="data.html"></div>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute();
const headers = useRequestHeaders(["authorization"]);
const page = Array.isArray(route.params.slug) ? route.params.slug.join("/") : route.params.slug;

const { data } = await useFetch(`/api/content`, {
  query: { path: encodeURIComponent(page as string), mount: route.params.mount },
  headers
});
</script>

<style>
html, body {
  scrollbar-gutter: stable;
  scrollbar-color: var(--scrollbar-color);
}
</style>
