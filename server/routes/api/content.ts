import { defineHandler } from "nitro";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeStringify from "rehype-stringify";

async function renderMarkdownToHtml(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "append" })
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
}

export default defineHandler(async (event) => {
  const url = new URL(event.req.url);
  const path = String(url.searchParams.get("path") || "/");

  if (!path.startsWith("/")) {
    return new Response("Query param 'path' must start with '/'", { status: 400 });
  }

  // Replace this with your WebDAV read logic.
  // Keeping content lookup here allows the renderer page to stay fully Vite-managed.
  const markdown = `# ${path === "/" ? "Home" : path}\n\nThis HTML is rendered on the server from markdown.`;
  const html = await renderMarkdownToHtml(markdown);

  return {
    path,
    html,
  };
});
