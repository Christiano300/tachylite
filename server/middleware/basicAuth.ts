import { MOUNTS_CONFIG_KEY } from "../../shared/types";
import { H3Event, setHeader } from "h3";

type Event = H3Event<globalThis.EventHandlerRequest>;

export default defineEventHandler(async (event) => {
  const pathname = event.path;
  let mountId;
  if (pathname.startsWith("/api/toc")) {
    mountId = pathname.split("/")[3];
  } else if (pathname.startsWith("/api/content")) {
    const query = getQuery(event);
    mountId = query.mount as string;
  } else if (pathname.startsWith("/md")) {
    mountId = pathname.split("/")[2];
  }
  if (!mountId) return;

  const storage = useStorage("persist");
  const mounts = (await storage.getItem(MOUNTS_CONFIG_KEY)) as Record<
    string,
    { password: string | null }
  > | null;
  if (!mounts || !mounts[mountId]) return;

  const mountPassword = mounts[mountId]!.password;
  if (mountPassword === null) return;
  const credentials = extractBasicAuth(event, mountId);
  if (!credentials) return;
  const providedPassword = credentials[1];

  const expectedPassword = mountPassword === "" ? "" : mountPassword;
  if (providedPassword !== expectedPassword) {
    console.warn(`Unauthorized access attempt to mount ${mountId} with password "${providedPassword}"`);
    return errorRequireAuth(event, mountId);
  }
});

function extractBasicAuth(event: Event, mountId: string) {
  const authHeader = getHeader(event, "authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return errorRequireAuth(event, mountId);
  }

  const base64Credentials = authHeader.slice(6); // Slice off "Basic "
  const credentials = atob(base64Credentials);
  return credentials.split(":");
}

function errorRequireAuth(event: Event, mountId: string) {
  setHeader(event, "WWW-Authenticate", `Basic realm="${mountId}"`);
  sendError(
    event,
    createError({
      statusCode: 401,
      message: "Unauthorized",
    }),
  );
}
