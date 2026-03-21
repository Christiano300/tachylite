import { createClient, ResponseDataDetailed } from "webdav";
import { CacheEntry, DAV_CACHE_KEY_PREFIX } from "~~/shared/types";

export async function cachedFetch(davPath: string) {
  const store = useStorage("tl");
  const cacheKey = DAV_CACHE_KEY_PREFIX + (await hashPath(davPath));
  if (await store.hasItem(cacheKey)) {
    return ((await store.getItem(cacheKey)) as CacheEntry).value;
  }
  return await fetchAndCache(davPath, cacheKey);
}

export async function updateCache(davPath: string, newEtag: string) {
  const store = useStorage("tl");
  const cacheKey = DAV_CACHE_KEY_PREFIX + (await hashPath(davPath));
  if (await store.hasItem(cacheKey)) {
    const entry = (await store.getItem(cacheKey)) as CacheEntry;
    if (entry.etag === newEtag) {
      return; // Cache is still valid
    }
    console.log(`Cache entry for ${davPath} is outdated, updating...`);
  } else {
    console.log(`No cache entry found for ${davPath}, creating new one...`);
  }

  fetchAndCache(davPath, cacheKey);
}

const client = createClient(process.env.DAV_URL || "", {
  username: process.env.DAV_USERNAME || "",
  password: process.env.DAV_PASSWORD || "",
});

async function fetchAndCache(davPath: string, cacheKey: string) {
  const store = useStorage("tl");

  const content = await fetchMd(davPath);
  if (content.headers.etag) {
    const newEntry: CacheEntry = { value: content.data, etag: content.headers.etag!.replaceAll('"', "") };
    store.setItem(cacheKey, newEntry);
  } else {
    console.warn(`No ETag found for ${davPath}, skipping cache update`);
  }
  return content.data;
}

async function fetchMd(davPath: string) {
  const url = `${process.env.FILES_URL}${davPath}`;
  return (await client.getFileContents(url, {
    format: "text",
    details: true,
  })) as ResponseDataDetailed<string>;
}

async function hashPath(path: string): Promise<string> {
  const buffer = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(path));
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replaceAll("/", "-")
    .replaceAll("+", "_")
    .substring(0, 24);
}
