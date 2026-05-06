import { requireMasterAuth, requireMountAuth } from "../utils/auth";

export default defineEventHandler(async (event) => {
  const pathname = event.path;
  if (pathname.startsWith("/md")) {
    const mountId = pathname.split("/")[2];
    if (await requireMountAuth(event, mountId)) return;
  } else if (pathname.startsWith("/config")) {
    if (requireMasterAuth(event)) return;
  }
});