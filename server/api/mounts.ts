import { mountConfigSchema } from "../types";

const key = "tl:mounts";

export default eventHandler({
  handler: async (event) => {
    if (event.method === "GET") {
      const storage = useStorage("mounts");
      const mounts = await storage.getItem(key);
      console.log(mounts, !mounts)
      return mounts ?? {};
    } else if (event.method === "PUT") {
      const body = await readValidatedBody(event, mountConfigSchema.parse);
      const mounts = Object.fromEntries(
        Object.entries(body).map(([id, config]) => [
          id, {
            displayName: config.displayName,
            davPath: config.davPath.replace(/^\//, "").replace(/\/$/, ""),
            password: config.password,
          }
        ])
      );

      const storage = useStorage("mounts");
      await storage.setItem(key, JSON.stringify(mounts));
      return { success: true };
    } else {
      return new Response("Method not allowed", { status: 405 });
    }
  },
});
