const key = "tl:mounts";

export default eventHandler({
  handler: async (event) => {
    const method = getMethod(event);
    
    if (method === "GET") {
      const storage = useStorage("mounts");
      const mounts = (await storage.getItem(key)) || "";
      if (typeof mounts !== "string") {
        return [];
      }
      try {
        return JSON.parse(mounts);
      } catch (error) {
        console.error("Failed to parse mounts from storage", error);
        return [];
      }
    } else if (method === "PUT") {
      const body = await readBody(event);

      const storage = useStorage("mounts");
      await storage.setItem(key, JSON.stringify(body));
      return { success: true };
    } else {
      return new Response("Method not allowed", { status: 405 });
    }
  },
});
