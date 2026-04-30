<template>
  <h1 class="text-4xl font-bold text-center mb-4">Tachylite</h1>

  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
    <NuxtLink v-for="mount in publicMounts" :key="mount.id" :to="`/md/${mount.id}`">
      <UCard class="hover:border-accented transition-colors cursor-pointer">
        <h2 class="text-xl font-semibold">{{ mount.config.displayName }}</h2>
        <p class="text-muted text-sm mt-1">{{ mount.config.davPath }}</p>
      </UCard>
    </NuxtLink>
  </div>

  <p v-if="Object.keys(publicMounts).length === 0" class="text-center text-muted">
    No public mounts available.
  </p>

  <div class="mt-16 pt-8 flex">
    <form @submit.prevent="accessMount" class="w-full max-w-sm space-y-3">
      <div class="flex gap-2">
        <UInput v-model="mountId" placeholder="Enter mount ID" class="flex-1" required />
        <UButton type="submit" color="primary" :disabled="!mountId">Access protected Mount</UButton>
      </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
const { data: mounts } =
  await useFetch<Record<string, { displayName: string; davPath: string; hasPassword: boolean }>>(
    "/api/publicMounts",
  );

const mountId = ref("");

const publicMounts = computed(() => {
  if (!mounts.value) return [];
  return Object.entries(mounts.value)
    .filter(([_, config]) => !config.hasPassword)
    .map(([id, config]) => ({ id, config }));
});

async function accessMount() {
  if (!mountId.value) return;
  navigateTo(`/md/${mountId.value}`);
}
</script>
