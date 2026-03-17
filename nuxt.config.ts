// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: false,
  nitro: {
    preset: "vercel",
    storage: {
      mounts: {
        driver: "fs",
        base: "./data",
      },
    },
    experimental: {
      tasks: true,
    },
    scheduledTasks: {
      "* * * * *": "tl:fetchDav",
    },
    vercel: {
      config: {
        crons: [{ schedule: "* * * * *", path: "/api/vercelCron/fetchDav" }],
      },
    },
  },
});
