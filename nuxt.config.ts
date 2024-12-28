// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
  ],

  plugins: [
    '~/plugins/globalStatesPlugin',
    '~/plugins/onAppVisiblePlugin',
    '~/plugins/onOnlinePlugin',
    // '~/plugins/graphqlWebsocketPlugin',
    '~/plugins/apollo',
  ],

  typescript: {
    tsConfig: {
      include: ['types/nuxt.d.ts'],
    }
  },

  ssr: false,

  runtimeConfig: {
    public: {
      severHost: process.env.SERVER_HOST,
      wsHost: process.env.WS_HOST,
      appDomain: process.env.APP_DOMAIN,
    }
  },

  devServer: {
    host: '0.0.0.0', // Слушать на всех сетевых интерфейсах
    port: 3000       // Замените на желаемый порт
  },

  css: ['~/styles/main.scss', '~/styles/vars.scss'],
  compatibilityDate: '2024-12-27',
})