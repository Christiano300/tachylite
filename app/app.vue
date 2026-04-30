<script setup>
const nuxtApp = useNuxtApp();
nuxtApp._isNuxtPageUsed = true;
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />

    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<style lang="css">
:root {
  --scrollbar-color: rgb(from var(--color-neutral-400) r g b / 50%) transparent;
}
</style>pn