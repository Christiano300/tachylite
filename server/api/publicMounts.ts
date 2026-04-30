import { MOUNTS_CONFIG_KEY, type PublicMountConfig } from "../../shared/types";

export default eventHandler({
  handler: async () => {
    const storage = useStorage("persist");
    const mounts = (await storage.getItem(MOUNTS_CONFIG_KEY)) as Record<string, { displayName: string; davPath: string; password: string | null }> | null;
    if (!mounts) return {};

    const publicMounts: PublicMountConfig = {};
    for (const [id, config] of Object.entries(mounts)) {
      publicMounts[id] = {
        displayName: config.displayName,
        davPath: config.davPath,
        hasPassword: config.password !== null,
      };
    }
    return publicMounts;
  },
});