import { definePlugin } from "nitro";
import { createClient, type SearchResult } from "webdav";

export default definePlugin(async () => {
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

  const files = (await client.search("/", { data: searchString })) as SearchResult;
  const baseURL = process.env.BASE_URL || "";
  if (baseURL == "") {
    console.warn(
      "No base URL set. If using nextcloud, this is likely a mistake. BASE_URL should be set to something like '/remote.php/dav/files/USERNAME/FOLDER'",
    );
  }
  for (const file of files.results) {
    if (!file.filename.startsWith(baseURL)) {
      console.warn(
        `Skipping file '${file.filename}' as it does not start with base URL '${baseURL}'`,
      );
      continue;
    }
    let path = file.filename.replace(baseURL, "");
    if (path.startsWith("/")) {
      path = path.substring(1);
    }
  }
});
