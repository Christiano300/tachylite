import type { H3Event } from "h3";
import { type MountConfig, MOUNTS_CONFIG_KEY } from "~~/shared/types";

type Event = H3Event<globalThis.EventHandlerRequest>;

export const requireMasterAuth = (event: Event): boolean => {
  const authHeader = getHeader(event, "authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    errorRequireAuth(event, "$master$");
    return true;
  }
  const [username, password] = atob(authHeader.slice(6)).split(":");
  const expectedUsername = process.env.MASTER_USER;
  const expectedPassword = process.env.MASTER_PASSWORD;
  if (username !== expectedUsername || password !== expectedPassword) {
    errorRequireAuth(event, "$master$");
    return true;
  }
  return false;
};

export const requireMountAuth = async (event: Event, mountId: string | null | undefined): Promise<boolean> => {
  const storage = useStorage("persist");
  const mounts = (await storage.getItem(MOUNTS_CONFIG_KEY)) as MountConfig | null;
  if (!mounts || !mountId || !mounts[mountId]) {
    sendError(event, createError({ statusCode: 404, message: "Mount not found" }));
    return true;
  }

  const mountPassword = mounts[mountId]!.password;
  if (mountPassword === null) return false;
  const credentials = extractBasicAuth(event, mountId);
  if (!credentials) return true;
  const providedPassword = credentials[1];

  const expectedPassword = mountPassword === "" ? "" : mountPassword;
  if (providedPassword !== expectedPassword) {
    console.warn(
      `Unauthorized access attempt to mount ${mountId} with password "${providedPassword}"`,
    );
    errorRequireAuth(event, mountId);
    return true;
  }
  return false;
};

/**
 * Extracts username and password from Basic Auth header
 * @returns Array containing [username, password], or if missing or malformed, sends a 401 response
 * and returns undefined. In that case, the caller should return immediately after calling this function
 */
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
