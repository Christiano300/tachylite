<template>
  <h1 class="text-4xl font-bold text-center mb-4">Tachylite</h1>

  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
    <NuxtLink v-for="mount in mounts" :key="mount.id" :to="`/md/${mount.id}`">
      <UCard class="hover:border-accented transition-colors cursor-pointer">
        <div class="flex justify-between">
          <h2 class="text-xl font-semibold">{{ mount.displayName }}</h2>
          <UIcon class="size-5" v-if="mount.hasPassword" name="i-lucide-lock-keyhole"></UIcon>
        </div>
        <p class="text-muted text-sm mt-1">{{ mount.description || "" }}</p>
      </UCard>
    </NuxtLink>
  </div>

  <p v-if="mounts?.length == 0" class="text-center text-muted">
    No public mounts available.
  </p>

  <div class="mt-16 pt-8 flex">
    <form @submit.prevent="accessMount" class="w-full max-w-sm space-y-3">
      <div class="flex gap-2">
        <UInput v-model="mountId" placeholder="Enter mount ID" class="flex-1" required />
        <UButton type="submit" color="primary" :disabled="!mountId">Access hidden Mount</UButton>
      </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
import type { PublicMount } from '~~/shared/types';

const { data: mounts } =
  await useFetch<PublicMount[]>(
    "/api/publicMounts",
  );

const mountId = ref("");

async function accessMount() {
  if (!mountId.value) return;
  navigateTo(`/md/${mountId.value}`);
}
</script>
