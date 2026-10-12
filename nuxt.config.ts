import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Enable TypeScript (less strict for development)
  typescript: {
    strict: false,
    typeCheck: false,
    // Nuxt 4 enables noUncheckedIndexedAccess unconditionally — it is tied to the
    // v4 compatibility version, NOT to `strict`. Pinning it false keeps the
    // typecheck surface comparable to Nuxt 3 so any new error is genuinely a Nuxt
    // 4 issue. Follow-up: flip this and `strict` together, deliberately.
    tsConfig: {
      compilerOptions: {
        noUncheckedIndexedAccess: false
      }
    }
  },

  // Add compatibility date
  compatibilityDate: '2026-08-16',

  // Development tools
  devtools: { enabled: true },

  // Runtime config (replaces env and publicRuntimeConfig)
  runtimeConfig: {
    // Private keys (only available on server-side)
    // Public keys (exposed to client-side)
    public: {
      baseUrl: process.env.APP_URL || 'https://qdjr.dev',
      // qdjr-admin API (apps/api). Netlify sets API_URL; local dev uses the Go
      // server on :8080.
      apiUrl: process.env.API_URL || 'https://api.qdjr.dev',
      gaId: process.env.GOOGLE_ANALYTICS_ID || 'G-KBZQ6KNY8T'
    }
  },

  // App config (replaces head configuration)
  app: {
    head: {
      // The default vibe (stores/theme.ts) in the page shell, so its tokens apply before any script runs.
      htmlAttrs: {'data-vibe': 'cartoon'},
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
          content: process.env.APP_URL || 'https://qdjr.dev'
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
          content: (process.env.APP_URL || 'https://qdjr.dev') + '/profile.jpg'
        },
        { name: 'apple-mobile-web-app-title', content: 'QDJr Blog' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        // Vibe fonts. Three static stylesheets (one per vibe) rather than a
        // runtime swap: browsers only download font binaries for text that is
        // actually rendered, so the inactive vibes cost one small CSS fetch each.
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap'
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,700,100,1&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600&display=swap'
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@600&family=Geist:wght@400;600&family=Geist+Mono:wght@400&display=swap'
        }
      ]
    }
  },

  // Global CSS — Tailwind v4 entrypoint
  css: ['~/assets/css/main.css'],

  // Auto import components
  components: true,

  // Modules (buildModules merged into modules in Nuxt 3)
  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    '@nuxtjs/i18n'
    // Note: robots and sitemap will be added back in next phase with proper configuration
  ],

  // Vietnamese at /, English under /en. Browsers whose preferred language is
  // English are redirected once from / to /en; the cookie remembers a manual
  // choice made with the header language switch.
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'vi',
    baseUrl: process.env.APP_URL || 'https://qdjr.dev',
    locales: [
      {code: 'vi', language: 'vi-VN', name: 'Tiếng Việt', file: 'vi.json'},
      {code: 'en', language: 'en-US', name: 'English', file: 'en.json'}
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_lang',
      redirectOn: 'root',
      alwaysRedirect: false,
      fallbackLocale: 'vi'
    }
  },

  // PWA configuration (updated for @vite-pwa/nuxt)
  pwa: {
    manifest: {
      lang: 'en'
    },
    workbox: {
      // Server-rendered pages: no app shell to fall back to, so no
      // navigateFallback (serving '/' for every URL would hydrate the wrong page).
      navigateFallback: null,
      // No precache: a low-traffic portfolio, and the old SPA-mode glob warnings.
      globPatterns: []
    }
  },

  // Server-rendered on request (the trip planner needs the Nitro server anyway),
  // so the first paint is real HTML instead of waiting for the app bundle.
  ssr: true,

  hooks: {
    // No <link rel="prefetch"> for lazy chunks in the server-rendered HTML: on
    // a slow phone connection three.js and the scene (650 KB) fought the page's
    // own CSS and fonts for bandwidth. They load when asked for (VibeScene
    // mounts after load), and NuxtLink still prefetches pages on sight.
    'build:manifest': (manifest) => {
      for (const chunk of Object.values(manifest)) chunk.prefetch = false
    }
  },

  // Pages render live, nothing is prerendered: no payload files or app manifest needed.
  experimental: {
    payloadExtraction: false,
    appManifest: false
  },

  // Nitro configuration
  nitro: {
    // Planned trips (/api/trips/plan), kept 30 days on disk across restarts.
    storage: {
      trips: {driver: 'fs', base: './.data/trips'}
    },
    prerender: {
      routes: []
    }
  },

  // Tailwind v4. Replaces @nuxtjs/tailwindcss, which is pinned to tailwindcss
  // ~3.4 and has no v4 support.
  vite: {
    plugins: [tailwindcss()]
  }
})
