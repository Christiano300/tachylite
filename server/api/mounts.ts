import { mountConfigSchema, MOUNTS_CONFIG_KEY } from "../../shared/types";

export default eventHandler({
  handler: async (event) => {
    if (event.method === "GET") {
      const storage = useStorage("tl");
      const mounts = await storage.getItem(MOUNTS_CONFIG_KEY);
      console.log(mounts, !mounts);
      return mounts ?? {};
    } else if (event.method === "PUT") {
      const body = await readValidatedBody(event, mountConfigSchema.safeParse);
      if (!body.success) {
        throw createError({ statusCode: 400, message: "Invalid mount configuration" });
      }
      const mounts = Object.fromEntries(
        Object.entries(body.data).map(([id, config]) => [
          id,
          {
            displayName: config.displayName,
            davPath: config.davPath.replace(/^\//, "").replace(/\/$/, ""),
            password: config.password,
          },
        ]),
      );

      const storage = useStorage("tl");
      await storage.setItem(MOUNTS_CONFIG_KEY, JSON.stringify(mounts), { allowOverwrite: true });
      return { success: true };
    } else {
      return new Response("Method not allowed", { status: 405 });
    }
  },
});
