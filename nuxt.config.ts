// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      script: [
        {
          src: "https://cdn.jsdelivr.net/npm/howler@2.2.3/dist/howler.core.min.js",
        },
      ],
    },
  },
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  runtimeConfig: {
    public: {
      AZURACAST_API_KEY: process.env.AZURACAST_API_KEY || 'api_key_missing'
    }
  }
})