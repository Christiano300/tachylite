import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
// @ts-ignore
import remarkWikiLink from "@flowershow/remark-wiki-link";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeStringify from "rehype-stringify";
import rehypePrism from "rehype-prism-plus";
import rehypeMathJax from "rehype-mathjax/svg";
import { createClient } from "webdav/dist/node/factory.js";
import { LAST_FETCH_KEY, MountedFile, MOUNTS_ENTRY_KEY_PREFIX, pathToUrl } from "../../shared/types";
import { Heading, Link, type Root } from "mdast";
import { inspect } from "unist-util-inspect";
import { visit } from "unist-util-visit";

export default defineEventHandler(async (event) => {
  checkLastFetch();

  const query = getQuery(event);
  const path = decodeURIComponent(query.path as string).replace(/^\//, "");
  const mountId = query.mount as string;
  const store = useStorage("mounts");
  const mountEntries = (await store.getItem(MOUNTS_ENTRY_KEY_PREFIX + mountId)) as Record<
    string,
    MountedFile
  >;

  if (!mountEntries || !mountEntries[path]) {
    throw createError({ statusCode: 404, message: "File not found" });
  }
  const client = createClient(process.env.DAV_URL || "", {
    username: process.env.DAV_USERNAME || "",
    password: process.env.DAV_PASSWORD || "",
  });
  const url = `${process.env.FILES_URL}${mountEntries[path].davPath}`;
  const markdown = (await client.getFileContents(url, { format: "text" })) as string;
  const html = await renderMarkdownToHtml(markdown, mountEntries[path].displayName);

  return {
    path,
    html,
  };
});

async function checkLastFetch() {
  const store = useStorage("mounts");
  const lastFetch = (await store.hasItem(LAST_FETCH_KEY))
    ? ((await store.getItem(LAST_FETCH_KEY)) as number)
    : null;
  const now = Date.now();
  if (!lastFetch || now - lastFetch > 20 * 1000) {
    store.setItem(LAST_FETCH_KEY, now);
    try {
      await runTask("tl:fetchDav");
    } catch (error) {
      console.error("Error running fetchDav task:", error);
    }
  }
}

async function renderMarkdownToHtml(markdown: string, title: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(addTitle, { title })
    .use(remarkGfm)
    .use(remarkWikiLink)
    .use(fixLinks)
    .use(remarkMath)
    .use(breakText)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "append" })
    .use(rehypeMathJax)
    .use(rehypePrism, { ignoreMissing: true,})
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
}

function addTitle(opts?: { title?: string }): (tree: Root) => void {
  const title = (opts || {}).title;
  return (root) => {
    if (!title) return;
    const children = root.children;
    const replacement: Heading = {
      type: "heading",
      depth: 1,
      children: [{ type: "text", value: title }],
      data: {
        hProperties: {
          class: "title-heading",
        },
      },
    };
    children.unshift(replacement);
  };
}

function fixLinks(): (tree: Root) => void {
  return (root) => {
    visit(root, "wikiLink", (node: Link) => {
      if (node.data && node.data.hProperties) {
        const href = node.data.hProperties.href;
        if (typeof href === "string") {
          node.data.hProperties.href = pathToUrl(href);
        }
      }
    });
    visit(root, "link", (node: Link) => {
      if (!node.url.match(/[*"<>:|?]/)) {
        node.url = pathToUrl(decodeURIComponent(node.url));
      }
    });
  };
}

function breakText(): (tree: Root) => void {
  return (root) => {
    console.log(inspect(root, {color: true}));
  };
}
