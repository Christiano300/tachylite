<template>
  <div v-if="data && data.html" class="prose prose-invert max-w-none" v-html="data.html"></div>
</template>

<script lang="ts" setup>
const route = useRoute();

const page = Array.isArray(route.params.slug) ? route.params.slug.join("/") : route.params.slug;

const { data, error } = useFetch(`/api/content`, {
  query: { path: encodeURIComponent(page as string), mount: route.params.mount },
});
</script>

<style></style>
