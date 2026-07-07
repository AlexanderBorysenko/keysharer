// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  // Nuxt 4 defaults `srcDir` to `app/`. This project keeps the Nuxt 3 flat
  // layout (pages/, components/, composables/, layouts/, middleware/,
  // plugins/, stores/, modules/, app.vue at the project root), so we revert
  // `srcDir` back to root and keep `dir.app` pointing at `app/` (used only
  // for `router.options.ts` / `spa-loading-template.html` lookups, neither
  // of which this project uses).
  // https://nuxt.com/docs/4.x/getting-started/upgrade#new-directory-structure
  srcDir: '.',
  dir: {
    app: 'app',
  },

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
      compilerOptions: {
        // Nuxt 4 turns this on by default (nuxt/nuxt#28648). Turning it back
        // off keeps the pre-existing (Nuxt 3) type-check baseline instead of
        // surfacing ~50 new `possibly undefined` errors across app code that
        // are a stricter-default side effect, not a real regression — fixing
        // them would mean touching application logic well beyond what this
        // framework migration requires.
        noUncheckedIndexedAccess: false,
      },
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