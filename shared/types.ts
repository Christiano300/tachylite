import { z } from "zod";
import { type Root } from "hast";

export type MountConfig = {
  [id: string]: { displayName: string; davPath: string; password: string | null };
};

export const mountConfigSchema = z.record(
  z.string(),
  z.object({
    displayName: z.string(),
    davPath: z.string(),
    password: z.string().nullable(),
  }),
);

export type MountedFile = {
  displayName: string;
  davPath: string;
  relativePath: string;
};

export type TocTree = {
  name: string;
  url: string;
  children: TocTree[];
};

export type HTree = Root;

export const LAST_FETCH_KEY = "tl:lastFetch";

export const MOUNTS_CONFIG_KEY = "tl:mounts";

export const MOUNTS_ENTRY_KEY_PREFIX = "tl-mounts:";

export const MOUNTS_TOC_KEY_PREFIX = "tl-toc:";

export function pathToUrl(path: string) {
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
