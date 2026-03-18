import { z } from "zod";

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

export const LAST_FETCH_KEY = "tl:lastFetch";

export const MOUNTS_CONFIG_KEY = "tl:mounts";

export const MOUNTS_ENTRY_KEY_PREFIX = "tl-mounts:";

export const MOUNTS_TOC_KEY_PREFIX = "tl-toc:";
