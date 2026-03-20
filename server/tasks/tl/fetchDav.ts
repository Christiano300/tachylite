import { createClient, type SearchResult } from "webdav";
import {
  LAST_FETCH_KEY,
  MountConfig,
  MountedFile,
  MOUNTS_CONFIG_KEY,
  MOUNTS_ENTRY_KEY_PREFIX,
  MOUNTS_TOC_KEY_PREFIX,
  TocTree,
  pathToUrl,
} from "~~/shared/types";

export default defineTask({
  meta: {
    name: "tl:fetchDav",
    description: "Fetches the file tree from the WebDAV server and generates the mounts",
  },
  run: async () => {
    console.log("Fetching WebDAV file tree...");
    const store = useStorage("mounts");

    const mountConfig = (await store.hasItem(MOUNTS_CONFIG_KEY))
      ? ((await store.getItem(MOUNTS_CONFIG_KEY)) as MountConfig)
      : {};

    const client = createClient(process.env.DAV_URL || "", {
      username: process.env.DAV_USERNAME || "",
      password: process.env.DAV_PASSWORD || "",
    });

    const searchString = `<?xml version="1.0" encoding="UTF-8"?>
    <d:searchrequest xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">
        <d:basicsearch>
            <d:select>
                <d:prop>
                    <oc:fileid/>
                    <d:displayname/>
                </d:prop>
            </d:select>
            <d:from>
                <d:scope>
                    <d:href>/files/iPhone</d:href>
                    <d:depth>infinity</d:depth>
                </d:scope>
            </d:from>
            <d:where>
                <d:eq>
                    <d:prop>
                        <d:getcontenttype/>
                    </d:prop>
                    <d:literal>text/markdown</d:literal>
                </d:eq>
            </d:where>
        </d:basicsearch>
    </d:searchrequest>`;

    const fileInfos = (await client.search("/", { data: searchString })) as SearchResult;
    store.setItem(LAST_FETCH_KEY, Date.now());
    console.log(`Found ${fileInfos.results.length} markdown files on WebDAV server`);

    const baseURL = process.env.BASE_URL || "";
    if (baseURL == "") {
      console.warn(
        "No base URL set. If using nextcloud, this is likely a mistake. BASE_URL should be set to something like '/remote.php/dav/files/USERNAME/FOLDER'",
      );
    }

    const files = fileInfos.results
      .map((file) => {
        if (!file.filename.startsWith(baseURL)) {
          console.warn(
            `Skipping file '${file.filename}' as it does not start with base URL '${baseURL}'`,
          );
          return null;
        }
        const path = file.filename.replace(baseURL, "").replace(/^\//, ""); // Remove base URL and leading slash
        const name = file.basename.replace(/\.md$/, "");

        return {
          displayName: name,
          davPath: path,
        };
      })
      .filter((x) => x !== null);

    for (const [mountId, mount] of Object.entries(mountConfig)) {
      const entries = {} as Record<string, MountedFile>;

      for (const file of files) {
        if (file.davPath.startsWith(mount.davPath)) {
          const relativePath = file.davPath.replace(mount.davPath, "").replace(/^\//, "");
          const relativeUrl = pathToUrl(relativePath);
          entries[relativeUrl] = {
            ...file,
            relativePath,
          };
        }
      }
      writeToc(mountId, entries);
      store.setItem(`${MOUNTS_ENTRY_KEY_PREFIX}${mountId}`, JSON.stringify(entries));
    }

    return { result: null };
  },
});

function writeToc(mountId: string, entries: Record<string, MountedFile>) {
  const toc: TocTree[] = [];
  for (const file of Object.values(entries)) {
    const parts = file.relativePath.split("/").filter((x) => x !== "");
    parts.pop();
    let currentLevel = toc;
    for (const part of parts) {
      let nextLevel = currentLevel.find((x) => x.name === part);
      if (!nextLevel) {
        nextLevel = { name: part, url: "", children: [] };
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
  const store = useStorage("mounts");
  store.setItem(`${MOUNTS_TOC_KEY_PREFIX}${mountId}`, JSON.stringify(toc));
  console.log(`Wrote TOC for mount '${mountId}' with ${Object.keys(entries).length} entries`);
}
