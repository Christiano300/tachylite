import { MountConfig, MOUNTS_CONFIG_KEY, PublicMount } from "../../shared/types";

export default eventHandler({
  handler: async () => {
    const storage = useStorage("persist");
    const mounts = (await storage.getItem(MOUNTS_CONFIG_KEY)) as MountConfig | null;
    if (!mounts) return {};

    const publicMounts: PublicMount[] = [];
    for (const [id, config] of Object.entries(mounts)) {
      publicMounts.push({
        id: id,
        displayName: config.displayName,
        description: config.description,
        hasPassword: config.password !== null,
      });
    }
    return publicMounts;
  },
});