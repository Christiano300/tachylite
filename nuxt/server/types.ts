export type MountConfig = {
  [id: string]: { displayName: string; davPath: string; password: string | null };
};

export type MountedFile = {
  displayName: string;
  url: string;
  davPath: string;
};
