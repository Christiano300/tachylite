import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import remarkWikiLink from "remark-wiki-link";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeStringify from "rehype-stringify";
import rehypePrism from "rehype-prism-plus";
import rehypeMathJax from "rehype-mathjax/svg";
import { createClient } from "webdav/dist/node/factory.js";
import { MountedFile, MOUNTS_ENTRY_STORAGE_KEY_PREFIX } from "../types";


async function renderMarkdownToHtml(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkWikiLink)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "append" })
    .use(rehypeMathJax)
    .use(rehypePrism)
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const path = decodeURIComponent(query.path as string).replace(/^\//, "");
  const mountId = query.mount as string;
  const store = useStorage("mounts");
  const mountEntries = await store.getItem(MOUNTS_ENTRY_STORAGE_KEY_PREFIX + mountId) as Record<string, MountedFile>;
  if (!mountEntries || !mountEntries[path]) {
    throw createError({ statusCode: 404, message: "File not found" });
  }
  const client = createClient(process.env.DAV_URL || "", {
    username: process.env.DAV_USERNAME || "",
    password: process.env.DAV_PASSWORD || "",
  });
  const url = `${process.env.FILES_URL}${mountEntries[path].davPath}`;
  console.log(url);
  const markdown = await client.getFileContents(url, { format: "text" }) as string;
  const html = await renderMarkdownToHtml(markdown);

  return {
    path,
    html,
  };
});
