<template>
  <UTree :items="items" :get-key="(item) => item.url" v-model="current">
    <template #item-label="{ item }">
      <NuxtLink
        v-if="item.url && !item.children?.length"
        :to="item.url"
        class="block w-full h-full"
        active-class="font-bold"
      >
        {{ item.label }}
      </NuxtLink>
      <span v-else>{{ item.label }}</span>
    </template>
  </UTree>
</template>

<script lang="ts" setup>
import type { TreeItem } from "@nuxt/ui";
import type { TocTree } from "~~/shared/types";
const {items} = defineProps<{items: (TreeItem & TocTree)[]}>();

const route = useRoute();

const current = computed(() => {
  let current: (TocTree & TreeItem) | undefined = undefined;
  const walk = (node: TocTree) => {
    if (node.url === route.path) {
      current = node;
      return;
    }
    node.children?.forEach(walk);
  };
  items.forEach(walk);
  return current;
});
</script>

<style></style>
