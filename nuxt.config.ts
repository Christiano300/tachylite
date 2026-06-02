import { qrcode } from "vite-plugin-qrcode";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  vite: {
    plugins: [qrcode()],
  },
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: true,

  routeRules: {
    "/md/**": { appLayout: "docs" },
  },

  nitro: {
    storage: {
      persist:
        process.env.NODE_ENV === "production"
          ? {
              driver: "s3",
              accessKeyId: process.env.R2_PERSIST_KEY_ID!,
              secretAccessKey: process.env.R2_PERSIST_KEY!,
              endpoint: process.env.R2_PERSIST_ENDPOINT!,
              bucket: process.env.R2_PERSIST_BUCKET!,
              region: "auto",
            }
          : {
              driver: "fs",
              base: "./data",
            },
      access: {
        driver: "s3",
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_ACCESS_KEY!,
        endpoint: process.env.R2_ACCESS_ENDPOINT!,
        bucket: process.env.R2_ACCESS_BUCKET!,
        region: "auto",
      },
    },
    experimental: {
      tasks: true,
      wasm: false,
    },
  },

  modules: ["@nuxt/ui", "@vueuse/nuxt"],
  css: ["~/assets/css/main.css"],
});
