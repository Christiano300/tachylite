// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: true,

  routeRules: {
    "/md/**": { appLayout: "default" },
    "/config": { appLayout: false },
  },

  nitro: {
    storage: {
      tl:
        process.env.NODE_ENV === "production"
          ? {
              driver: "upstash",
              url: process.env.KV_REST_API_URL!,
              token: process.env.KV_REST_API_TOKEN!,
            }
          : {
              driver: "fs",
              base: "./data",
            },
    },
    experimental: {
      tasks: true,
    },
  },

  modules: ["@nuxt/ui"],
  css: ["~/assets/css/main.css"],
});
