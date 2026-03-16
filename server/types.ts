import { z } from "zod";

export type MountConfig = {
  [id: string]: { displayName: string; davPath: string; password: string | null };
};

export const mountConfigSchema = z.record(z.string(), z.object({
  displayName: z.string(),
  davPath: z.string(),
  password: z.string().nullable(),
}));

export type MountedFile = {
  displayName: string;
  url: string;
  davPath: string;
};

export const MOUNTS_CONFIG_STORAGE_KEY = "tl:mounts";

export const MOUNTS_ENTRY_STORAGE_KEY_PREFIX = "tl-mounts:";
