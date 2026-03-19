// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: true,

  nitro: {
    storage: {
      mounts: process.env.NODE_ENV === "production"
        ? {
            driver: "vercel-blob",
            access: "private",
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
