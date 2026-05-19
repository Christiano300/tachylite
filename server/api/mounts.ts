import { mountConfigSchema, MOUNTS_CONFIG_KEY } from "../../shared/types";
import { masterAuthDenied } from "../utils/auth";

export default eventHandler({
  handler: async (event) => {
    if (masterAuthDenied(event)) return;
    if (event.method === "GET") {
      const storage = useStorage("persist");
      const mounts = await storage.getItem(MOUNTS_CONFIG_KEY);
      return mounts ?? {};
    } else if (event.method === "PUT") {
      const body = await readValidatedBody(event, mountConfigSchema.safeParse);
      if (!body.success) {
        throw createError({ statusCode: 400, message: "Invalid mount configuration" + body.data });
      }
      const mounts = body.data;
      for (const config of Object.values(mounts)) {
        config.davPath = config.davPath.replace(/^\//, "").replace(/\/$/, "");
      }

      const storage = useStorage("persist");
      await storage.setItem(MOUNTS_CONFIG_KEY, mounts);
      return { success: true };
    } else {
      return new Response("Method not allowed", { status: 405 });
    }
  },
});
