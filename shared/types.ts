import { z } from "zod";
import { type Root } from "hast";

export type MountConfig = {
  [id: string]: {
    displayName: string;
    davPath: string;
    password?: string;
    hidden: boolean;
    description?: string;
  };
};

export type PublicMount = {
  id: string;
  displayName: string;
  description?: string;
  hasPassword: boolean;
};

export const mountConfigSchema = z.record(
  z.string(),
  z.object({
    displayName: z.string(),
    davPath: z.string(),
    password: z.string().optional(),
    hidden: z.boolean(),
    description: z.string().optional(),
  }),
);

export type MountedFile = {
  displayName: string;
  filePath: string;
  r2Path: string;
  relativePath: string;
};

export type TocTree = {
  name: string;
  url: string;
  children: TocTree[];
};

export type HTree = Root;

export const LAST_FETCH_KEY = "dav:lastFetch";

export const MOUNTS_CONFIG_KEY = "mounts:config";

export const MOUNTS_ENTRY_KEY_PREFIX = "mount_entry:";

export const MOUNTS_TOC_KEY_PREFIX = "mount_toc:";

export const MASTER_AUTH_REALM = "$master$";

export function pathToUrl(path: string) {
  return path
    .split("/")
    .map((part) =>
      part
        .replace(/\.md$/, "")
        .replace(/ /g, "_")
        .toLowerCase()
        .replace(/[^A-Za-z0-9#]+/g, "-"),
    )
    .join("/");
}
