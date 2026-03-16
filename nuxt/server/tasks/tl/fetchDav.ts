import { createClient, type SearchResult } from "webdav";
import { MountConfig, MountedFile } from "~~/server/types";

function mapPath(path: string) {
  return path
    .replace(/\.md$/, "")
    .replace(/ /g, "_")
    .toLowerCase()
    .replace(/[^A-Za-z0-9]+/g, "-");
}

export default defineTask({
  meta: {
    name: "tl:fetchDav",
    description: "Fetches the file tree from the WebDAV server and generates the mounts",
  },
  run: async () => {
    const store = useStorage("mounts");

    const mountsStr = (await store.getItem("tl:mounts")) ?? "";
    if (typeof mountsStr !== "string") {
      console.error("Invalid mounts configuration in storage");
      return { result: null };
    }
    const mountConfig = (JSON.parse(mountsStr) || {}) as MountConfig;

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
        let path = file.filename.replace(baseURL, "");
        if (!path.startsWith("/")) {
          path = "/" + path;
        }
        let name = file.basename;
        if (name.endsWith(".md")) {
          name = name.substring(0, name.length - 3);
        }

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
          const relativeUrl = file.url.replace(mapPath(mount.davPath), "");
          entries[relativeUrl] = file;
        }

        store.setItem(`tl-mounts:${mountId}`, JSON.stringify(entries));
      }
    }

    return { result: null };
  },
});