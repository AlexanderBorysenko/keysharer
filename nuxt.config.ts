// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
  ],
  plugins: [
    '~/graphql/graphql-clients-plugin',
  ],
  typescript: {
    tsConfig: {
      include: ['types/nuxt.d.ts'],
    }
  },
  runtimeConfig: {
    public: {
      severHost: process.env.SERVER_HOST || 'http://localhost:4000',
      wsHost: process.env.WS_HOST || 'ws://localhost:4000',
    }
  },
  devServer: {
    host: '0.0.0.0', // Слушать на всех сетевых интерфейсах
    port: 3000       // Замените на желаемый порт
  },
  css: ['~/styles/main.scss',

    '~/styles/vars.scss'
  ],
})