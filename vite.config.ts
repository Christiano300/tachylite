import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    nitro({
      serverDir: "./server",
      $production: {
        minify: true,
      },
      storage: {
        entries: {
          driver: "fs",
          base: "./data",
        }
      }
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
