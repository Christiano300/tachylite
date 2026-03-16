import { createClient, type SearchResult } from "webdav";
import {
  MountConfig,
  MountedFile,
  MOUNTS_CONFIG_STORAGE_KEY,
  MOUNTS_ENTRY_STORAGE_KEY_PREFIX,
} from "~~/server/types";

function mapPath(path: string) {
  return path
    .split("/")
    .map((part) =>
      part
        .replace(/\.md$/, "")
        .replace(/ /g, "_")
        .toLowerCase()
        .replace(/[^A-Za-z0-9]+/g, "-"),
    )
    .join("/");
}

function writeToc(mountId: string, entries: Record<string, MountedFile>) {
  void mountId;
  void entries;
  // do later
  // const toc = {} as Record<string, any>;
  // const store = useStorage("mounts");
  // store.setItem(`${MOUNTS_TOC_STORAGE_KEY_PREFIX}${mountId}`, JSON.stringify(toc));
}

export default defineTask({
  meta: {
    name: "tl:fetchDav",
    description: "Fetches the file tree from the WebDAV server and generates the mounts",
  },
  run: async () => {
    const store = useStorage("mounts");

    const mountConfig = (await store.getItem(MOUNTS_CONFIG_STORAGE_KEY)) as MountConfig;

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
    const baseURL = process.env.BASE_URL || "";
    if (baseURL == "") {
      console.warn(
        "No base URL set. If using nextcloud, this is likely a mistake. BASE_URL should be set to something like '/remote.php/dav/files/USERNAME/FOLDER'",
      );
    }

    const files: MountedFile[] = fileInfos.results
      .map((file) => {
        if (!file.filename.startsWith(baseURL)) {
          console.warn(
            `Skipping file '${file.filename}' as it does not start with base URL '${baseURL}'`,
          );
          return null;
        }
        const path = file.filename.replace(baseURL, "").replace(/^\//, ""); // Remove base URL and leading slash
        const name = file.basename.replace(/\.md$/, "");
        const url = mapPath(path);

        return {
          displayName: name,
          davPath: path,
          url,
        };
      })
      .filter((x) => x !== null);

    for (const [mountId, mount] of Object.entries(mountConfig)) {
      const entries = {} as Record<string, MountedFile>;

      for (const file of files) {
        if (file.davPath.startsWith(mount.davPath)) {
          const relativeUrl = file.url.replace(mapPath(mount.davPath), "").replace(/^\//, "");
          entries[relativeUrl] = file;
        }
      }
      writeToc(mountId, entries);
      store.setItem(`${MOUNTS_ENTRY_STORAGE_KEY_PREFIX}${mountId}`, JSON.stringify(entries));
    }

    return { result: null };
  },
});
