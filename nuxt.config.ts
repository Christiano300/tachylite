// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  nitro: {
    storage: {
      mounts: {
        driver: "fs",
        base: "./data",
      }
    },
    experimental: {
      tasks: true,
    },
    scheduledTasks: {
      '*/15 * * * * *': 'tl:fetchDav',
    }
  }
})
