import { requireMountAuth } from "~~/server/utils/auth";
import { MOUNTS_TOC_KEY_PREFIX, TocTree } from "~~/shared/types";

export default defineEventHandler(async (event) => {
  const mount = getRouterParam(event, "mount");
  if (await requireMountAuth(event, mount)) return;
  const store = useStorage("persist");
  const toc = (await store.getItem(MOUNTS_TOC_KEY_PREFIX + mount)) as TocTree[] | null;
  return toc;
});
