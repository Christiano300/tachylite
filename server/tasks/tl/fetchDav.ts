import {
  MountConfig,
  MountedFile,
  MOUNTS_CONFIG_KEY,
  MOUNTS_ENTRY_KEY_PREFIX,
  MOUNTS_TOC_KEY_PREFIX,
  TocTree,
  pathToUrl,
  LAST_FETCH_KEY,
} from "~~/shared/types";

import he from "he";

export default defineTask({
  meta: {
    name: "tl:fetchDav",
    description: "Fetches the file tree from the WebDAV server and generates the mounts",
  },
  run: async () => {
    console.log("Fetching WebDAV file tree...");
    const store = useStorage("persist");

    const mountConfig = (await store.hasItem(MOUNTS_CONFIG_KEY))
      ? ((await store.getItem(MOUNTS_CONFIG_KEY)) as MountConfig)
      : {};

    const accessStore = useStorage("access");
    const fileNames = await accessStore.getKeys();

    store.setItem(LAST_FETCH_KEY, Date.now(), { allowOverwrite: true });
    console.log(`Found ${fileNames.length} markdown files on WebDAV server`);

    const files = fileNames
      .filter((key) => key.endsWith(".md"))
      .map((file) => {
        const parts = file.split(":").map(part => he.decode(part));
        const name = parts.at(-1)?.replace(/\.md$/, "") ?? "";

        return {
          displayName: name,
          r2Path: file,
          filePath: file.split(":").map(part => he.decode(part)).join("/"),
        };
      });
    
    for (const [mountId, mount] of Object.entries(mountConfig)) {
      const entries = {} as Record<string, MountedFile>;

      for (const file of files) {
        if (file.filePath.startsWith(mount.davPath)) {
          const relativePath = file.filePath.replace(mount.davPath, "").replace(/^\//, "");
          const relativeUrl = pathToUrl(relativePath);
          entries[relativeUrl] = {
            ...file,
            relativePath,
          };
        }
      }
      writeToc(mountId, entries);
      store.setItem(`${MOUNTS_ENTRY_KEY_PREFIX}${mountId}`, JSON.stringify(entries), { allowOverwrite: true });
    }

    return { result: null };
  },
});

function writeToc(mountId: string, entries: Record<string, MountedFile>) {
  const toc: TocTree[] = [];
  for (const file of Object.values(entries)) {
    const parts = file.relativePath.split("/").filter((x) => x !== "");
    const currentParts = [];
    parts.pop();
    let currentLevel = toc;
    for (const part of parts) {
      currentParts.push(part);
      let nextLevel = currentLevel.find((x) => x.name === part);
      if (!nextLevel) {
        nextLevel = { name: part, url: `/md/${mountId}/${pathToUrl(currentParts.join("/"))}`, children: [] };
        currentLevel.push(nextLevel);
      } else {
        if (!nextLevel.children) {
          nextLevel.children = [];
        }
      }
      currentLevel = nextLevel.children;
    }
    currentLevel.push({
      name: file.displayName,
      url: `/md/${mountId}/${pathToUrl(file.relativePath)}`,
      children: [],
    });
  }
  const store = useStorage("persist");
  store.setItem(`${MOUNTS_TOC_KEY_PREFIX}${mountId}`, JSON.stringify(toc), { allowOverwrite: true });
  console.log(`Wrote TOC for mount '${mountId}' with ${Object.keys(entries).length} entries`);
}

