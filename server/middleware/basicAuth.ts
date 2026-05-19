import { masterAuthDenied, mountAuthDenied } from "../utils/auth";

export default defineEventHandler(async (event) => {
  const pathname = event.path;
  if (pathname.startsWith("/md")) {
    const mountId = pathname.split("/")[2];
    if (await mountAuthDenied(event, mountId)) return;
  } else if (pathname.startsWith("/config")) {
    if (masterAuthDenied(event)) return;
  }
});