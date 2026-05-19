<template>
  <h1 class="text-4xl font-bold text-center mb-8">Configure Mounts</h1>

  <div class="max-w-4xl mx-auto space-y-6">
    <UCard v-for="mount in mounts" :key="mount.id">
      <div class="flex items-center gap-2 justify-between space-y-4">
        <div class="flex items-center gap-2">
          <UFormField name="id" label="Mount ID">
            <UInput v-model="mount.id" />
          </UFormField>
          <UFormField name="displayName" label="Display Name">
            <UInput v-model="mount.displayName" />
          </UFormField>
          <UFormField name="davPath" label="DAV Path">
            <UInput v-model="mount.davPath" />
          </UFormField>
          <UFormField name="hidden" label="Hidden">
            <UCheckbox v-model="mount.hidden" />
          </UFormField>
          <UFormField name="password" label="Password">
            <UInput
              v-model="mount.password"
              :type="mount.showPw ? 'text' : 'password'"
              placeholder="Password"
              :ui="{ trailing: 'pe-1' }"
            >
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  :icon="mount.showPw ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  :aria-label="mount.showPw ? 'Hide password' : 'Show password'"
                  :aria-pressed="mount.showPw"
                  aria-controls="password"
                  @click="mount.showPw = !mount.showPw"
                />
              </template>
            </UInput>
          </UFormField>
        </div>
        <div>
          <UButton
            color="error"
            variant="ghost"
            size="md"
            @click="removeMount(mount.id)"
            icon="i-lucide-trash"
          ></UButton>
        </div>
      </div>
      <UFormField name="description" label="Description" class="w-full">
        <UInput
          v-model="mount.description"
          placeholder="Optional description for this mount"
          class="w-full"
        />
      </UFormField>
    </UCard>

    <div class="flex gap-4">
      <UButton @click="addMount">Add Mount</UButton>
      <UButton color="primary" :loading="saving" :disabled="!hasChanges" @click="saveMounts"
        >Save Changes</UButton
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { MountConfig } from "~~/shared/types";

type Mount = MountConfig[keyof MountConfig] & { id: string; showPw: boolean };

const saving = ref(false);
const mounts = ref<Mount[]>([]);
const originalMounts = ref<Mount[]>([]);

const { data, error, refresh } = await useFetch("/api/mounts", {
  transform: (data: Record<string, Mount>): Mount[] => {
    const result: Mount[] = [];
    for (const [id, mount] of Object.entries(data || {})) {
      result.push({
        id,
        displayName: mount.displayName,
        davPath: mount.davPath,
        hidden: mount.hidden,
        password: mount.password ?? "",
        description: mount.description ?? "",
        showPw: false,
      });
    }
    return result;
  },
});

watch(
  data,
  (newData) => {
    if (newData) {
      mounts.value = structuredClone(newData);
      originalMounts.value = structuredClone(newData);
    }
  },
  { immediate: true },
);

function addMount() {
  mounts.value.push({
    id: "",
    displayName: "",
    davPath: "",
    hidden: false,
    password: "",
    description: "",
    showPw: false,
  });
}

function removeMount(id: string) {
  const index = mounts.value.findIndex((m) => m.id === id);
  if (index !== -1) {
    mounts.value.splice(index, 1);
  }
}

const hasChanges = computed(() => {
  return JSON.stringify(mounts.value) !== JSON.stringify(originalMounts.value);
});

async function saveMounts() {
  saving.value = true;
  try {
    const toSave: MountConfig = {};
    for (const mount of mounts.value) {
      toSave[mount.id] = {
        displayName: mount.displayName,
        davPath: mount.davPath,
        hidden: mount.hidden,
        password: mount.password ? mount.password : undefined,
        description: mount.description,
      };
    }
    await $fetch("/api/mounts", {
      method: "PUT",
      body: toSave,
    });
    originalMounts.value = structuredClone(mounts.value);
    await refresh();
  } finally {
    saving.value = false;
  }
}
</script>
