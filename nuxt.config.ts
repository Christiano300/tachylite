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
              driver: "vercel-blob",
              access: "public",
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
