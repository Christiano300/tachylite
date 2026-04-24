<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/">
        <span class="text-xl font-bold">Tachylite</span>
      </NuxtLink>
    </template>
    <template #default>
      <slot />
    </template>
  </UHeader>
</template>