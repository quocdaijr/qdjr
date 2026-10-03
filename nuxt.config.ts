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
      baseUrl: process.env.APP_URL || 'https://qdjr.me',
      // Empty by default: api.qdjr.me no longer resolves (NXDOMAIN). An empty
      // value makes every $api call short-circuit to an empty result with zero
      // network traffic, instead of a multi-second DNS failure on each
      // navigation. Set API_URL to re-enable the legacy blog surface.
      apiUrl: process.env.API_URL || '',
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

  // Plugins are auto-scanned from <srcDir>/plugins and deduped by resolved path,
  // so listing them here was redundant. Dropping the array also removes eight
  // hardcoded paths that would need maintaining.

  // Auto import components
  components: true,

  // Modules (buildModules merged into modules in Nuxt 3)
  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    '@nuxt/content',
    '@nuxtjs/i18n'
    // Note: robots and sitemap will be added back in next phase with proper configuration
  ],

  // @nuxt/content configuration
  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'github-light-high-contrast',
            dark: 'github-dark-high-contrast'
          },
          langs: ['js', 'ts', 'vue', 'bash', 'json', 'yaml', 'md', 'html', 'css', 'php', 'python', 'go']
        }
      }
    }
  },

  // Vietnamese at /, English under /en. Browsers whose preferred language is
  // English are redirected once from / to /en; the cookie remembers a manual
  // choice made with the header language switch.
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'vi',
    baseUrl: process.env.APP_URL || 'https://qdjr.me',
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

  // No pinia.storesDirs override needed: <srcDir>/stores (app/stores) is the
  // default now that the sources live under app/.

  // PWA configuration (updated for @vite-pwa/nuxt)
  pwa: {
    manifest: {
      lang: 'en'
    },
    workbox: {
      navigateFallback: '/',
      // Disable workbox precaching entirely — in SPA mode @vite-pwa/nuxt runs
      // workbox globbing before Nitro copies client assets into
      // `.output/public/`, so every glob pattern (defaults or custom) emits
      // "doesn't match any files" warnings. Runtime navigateFallback still
      // handles offline shell; no precache is fine for a low-traffic portfolio.
      globPatterns: []
    }
  },

  // SSR configuration - disable for now due to directive SSR issues
  ssr: false,

  // SPA mode doesn't emit `_payload.json` or `_nuxt/builds/*.json`, so
  // turning these off avoids two "workbox glob pattern doesn't match any files"
  // build warnings from @vite-pwa/nuxt without affecting runtime behaviour.
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
      // Disable prerendering for now due to SSR directive issues
      // This can be re-enabled after converting components to Composition API
      routes: []
    }
  },

  // Build tuning
  vite: {
    // Tailwind v4. Replaces @nuxtjs/tailwindcss, which is pinned to
    // tailwindcss ~3.4 and has no v4 support.
    plugins: [tailwindcss()],
    build: {
      // The main bundle is ~1MB because several legacy client plugins (prismjs
      // with many languages, video.js, vue-spinner) are registered globally.
      // They only run on /legacy-blogs/* but are bundled eagerly. The whole
      // legacy surface is slated for removal, so raising the warning threshold
      // here is intentional until that happens. three.js is NOT part of this:
      // it is reached only through dynamic imports in app/scenes/* and lands in
      // its own async chunk.
      chunkSizeWarningLimit: 1200
    }
  },

  // PostCSS: rewrite the deprecated `color-adjust` shorthand to `print-color-adjust`
  // before Vite's CSS processor warns on it. Needed because prismjs still ships the
  // deprecated form in its plugin CSS (node_modules/prismjs/plugins/line-highlight/*.css)
  // and we can't edit vendor files.
  postcss: {
    plugins: {
      // Anchored with ~~ (rootDir) rather than a bare relative path so resolution
      // stays unambiguous when srcDir moves to app/ and under Vite 8.
      '~~/postcss-plugins/rewrite-color-adjust.cjs': {}
    }
  },

  // Note: Robots and sitemap configuration will be added back in next phase
})
