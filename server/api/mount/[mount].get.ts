import { mountAuthDenied } from "~~/server/utils/auth";
import { MountConfig, MOUNTS_CONFIG_KEY, PublicMount } from "~~/shared/types";

export default defineEventHandler(async (event): Promise<PublicMount | void> => {
  const mount = getRouterParam(event, "mount");
  if (mount === undefined) {
    return sendError(event, createError({ statusCode: 400 }));
  }
  if (await mountAuthDenied(event, mount)) return;
  const store = useStorage("persist");
  const mounts = (await store.getItem(MOUNTS_CONFIG_KEY)) as MountConfig;
  if (!mounts || !mounts[mount]) {
    return sendError(event, createError({ statusCode: 404 }));
  }
  const mountInfo = mounts[mount];
  return {
    id: mount,
    displayName: mountInfo.displayName,
    hasPassword: mountInfo.password !== null && mountInfo.password !== undefined,
    description: mountInfo.description,
  };
});
