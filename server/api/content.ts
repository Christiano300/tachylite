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
import { LAST_FETCH_KEY, MountedFile, MOUNTS_ENTRY_KEY_PREFIX, pathToUrl } from "../../shared/types";
import { Heading, Link, type Root } from "mdast";
import { visit } from "unist-util-visit";
import { cachedFetch } from "../utils/cache";

export default defineEventHandler(async (event) => {
  checkLastFetch();

  const query = getQuery(event);
  const path = decodeURIComponent(query.path as string).replace(/^\//, "");
  const mountId = query.mount as string;
  const store = useStorage("tl");
  const mountEntries = (await store.getItem(MOUNTS_ENTRY_KEY_PREFIX + mountId)) as Record<
    string,
    MountedFile
  >;

  if (!mountEntries || !mountEntries[path]) {
    throw createError({ statusCode: 404, message: "File not found" });
  }
  const markdown = await cachedFetch(mountEntries[path].davPath);
  const html = await renderMarkdownToHtml(markdown, mountEntries[path].displayName);

  return {
    path,
    html,
  };
});

async function checkLastFetch() {
  const store = useStorage("tl");
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
      if (!node.url.match(/[*"<>:|?]/)) { // invalid in file names, excluding /
        node.url = pathToUrl(decodeURIComponent(node.url));
      }
    });
  };
}

function breakText(): (tree: Root) => void {
  return (root) => {
    visit(root, "text", (node, index, parent) => {
      if (node.value.includes("\n")) {
        const parts = node.value.split("\n");
        const newNodes = [];
        for (let i = 0; i < parts.length; i++) {
          newNodes.push({ type: "text", value: parts[i] });
          if (i < parts.length - 1) {
            newNodes.push({ type: "break" });
          }
        }
        // @ts-expect-error thinks only the math extension is valid and ignores the default mdast types
        parent!.children.splice(index!, 1, ...newNodes);
      }
    });
  };
}
