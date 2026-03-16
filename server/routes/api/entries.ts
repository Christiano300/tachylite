import { basicAuth } from "h3";
import { defineHandler } from "nitro";
import { useStorage } from "nitro/storage";

const key = "tl:entries";

export default defineHandler({
  middleware: [basicAuth({ username: "admin", password: process.env.MASTER_PASSWORD || "admin" })],
  handler: async (event) => {
    if (event.req.method === "GET") {
      const storage = useStorage("entries");
      const entries = (await storage.getItem(key)) || "";
      if (typeof entries !== "string") {
        return [];
      }
      try {
        return JSON.parse(entries);
      } catch (error) {
        console.error("Failed to parse entries from storage", error);
        return [];
      }
    } else if (event.req.method === "PUT") {
      const body = await event.req.json();

      const storage = useStorage("entries");
      await storage.setItem(key, JSON.stringify(body));
      return { success: true };
    } else {
      return new Response("Method not allowed", { status: 405 });
    }
  },
});
