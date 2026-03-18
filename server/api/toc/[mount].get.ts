import { MOUNTS_TOC_KEY_PREFIX, TocTree } from "~~/shared/types";

export default defineEventHandler(async (event) => {
  const mount = getRouterParam(event, "mount");
  const store = useStorage("mounts");
  const toc = (await store.getItem(MOUNTS_TOC_KEY_PREFIX + mount)) as TocTree[] | null;
  return toc;
});
