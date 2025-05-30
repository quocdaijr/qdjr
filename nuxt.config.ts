// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Enable TypeScript (less strict for development)
  typescript: {
    strict: false,
    typeCheck: false
  },

  // Add compatibility date
  compatibilityDate: '2025-05-25',

  // Development tools
  devtools: { enabled: true },

  // Runtime config (replaces env and publicRuntimeConfig)
  runtimeConfig: {
    // Private keys (only available on server-side)
    // Public keys (exposed to client-side)
    public: {
      baseUrl: process.env.APP_URL || 'https://qdjr.me',
      apiUrl: process.env.API_URL || 'https://api.qdjr.me/v1',
      gaId: process.env.GOOGLE_ANALYTICS_ID || 'G-KBZQ6KNY8T'
    }
  },

  // App config (replaces head configuration)
  app: {
    head: {
      title: 'QDJr Blog',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'This is a small blog of Nguyen Quoc Dai'
        },
        {
          name: 'keywords',
          content: 'development, software, qdjr, quocdaijr, nguyen quoc dai, blog'
        },
        {
          property: 'og:url',
          content: process.env.APP_URL || 'https://qdjr.me'
        },
        {
          property: 'og:type',
          content: 'website'
        },
        {
          property: 'og:site_name',
          content: 'QDJr'
        },
        {
          property: 'og:title',
          content: 'QDJr Blog'
        },
        {
          property: 'og:description',
          content: 'This is a small blog of Nguyen Quoc Dai'
        },
        {
          property: 'og:image',
          content: (process.env.APP_URL || 'https://qdjr.me') + '/profile.jpg'
        },
        { name: 'apple-mobile-web-app-title', content: 'QDJr Blog' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // Global CSS
  css: [],

  // Plugins (converted to TypeScript and Nuxt 3 format)
  plugins: [
    '~/plugins/api.ts',
    '~/plugins/resize.client.ts',
    '~/plugins/gtag.client.ts',
    '~/plugins/prism.client.ts',
    '~/plugins/videojs.client.ts',
    '~/plugins/vue-particles.client.ts',
    '~/plugins/click-outside.client.ts',
    '~/plugins/theme.client.ts'
  ],

  // Auto import components
  components: true,

  // Modules (buildModules merged into modules in Nuxt 3)
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt'
    // Note: robots and sitemap will be added back in next phase with proper configuration
  ],

  // Pinia configuration
  pinia: {
    storesDirs: ['./stores/**']
  },

  // PWA configuration (updated for @vite-pwa/nuxt)
  pwa: {
    manifest: {
      lang: 'en'
    },
    workbox: {
      navigateFallback: '/'
    }
  },

  // Tailwind CSS configuration
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.ts'
  },

  // SSR configuration - disable for now due to directive SSR issues
  ssr: false,

  // Nitro configuration
  nitro: {
    prerender: {
      // Disable prerendering for now due to SSR directive issues
      // This can be re-enabled after converting components to Composition API
      routes: []
    }
  },

  // Note: Robots and sitemap configuration will be added back in next phase
})
