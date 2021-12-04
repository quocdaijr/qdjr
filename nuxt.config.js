import {getCategories, getTags, getPosts} from "./plugins/api";

export default {
  env: {
    baseUrl: process.env.APP_URL || 'https://qdjr.me',
    apiUrl: process.env.API_URL || 'https://api.qdjr.me/v1',
    gaId: process.env.GOOGLE_ANALYTICS_ID || 'G-KBZQ6KNY8T'
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'QDJr Blog',
    meta: [
      {charset: 'utf-8'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1'},
      {
        hid: 'description',
        name: 'description',
        content: 'This is a small blog of Nguyen Quoc Dai'
      },
      {
        hid: 'keywords',
        name: 'keywords',
        content: 'development, software, qdjr, quocdaijr, nguyen quoc dai, blog'
      },
      {
        hid: 'og:url',
        property: 'og:url',
        content: process.env.APP_URL || 'https://qdjr.me'
      },
      {
        hid: 'og:type',
        property: 'og:type',
        content: 'website'
      },
      {
        hid: 'og:site_name',
        name: 'og:site_name',
        content: 'QDJr'
      },
      {
        hid: 'og:title',
        name: 'og:title',
        content: 'QDJr Blog'
      },
      {
        hid: 'og:description',
        name: 'og:description',
        content: 'This is a small blog of Nguyen Quoc Dai'
      },
      {
        hid: 'og:image',
        name: 'og:image',
        content: (process.env.APP_URL || 'https://qdjr.me') + '/profile.jpg',

      },
      {hid: 'apple-mobile-web-app-title', name: 'apple-mobile-web-app-title', content: 'QDJr Blog'},
      {name: 'format-detection', content: 'telephone=no'}
    ],
    link: [
      {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'}
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/resize',
    '~/plugins/gtag',
    {
      src: '@/plugins/vue-particles',
      ssr: false
    }
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/stylelint
    '@nuxtjs/stylelint-module',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
    '@nuxtjs/dayjs',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    baseURL: process.env.API_URL || 'https://api.qdjr.me/v1'
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en'
    },
    icon: false
  },

  purgeCSS: {
    mode: 'postcss',
    enabled: (process.env.NODE_ENV === 'production')
  },


  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    extractCSS: true
  },

  publicRuntimeConfig: {
    axios: {
      baseURL: process.env.API_URL || 'https://api.qdjr.me/v1'
    }
  },
  config: {
    productionTip: false,
    performance: true
    // devtools: true
  },
  mode: 'universal',
  dayjs: {
    locales: ['en'],
    defaultLocale: 'en',
    plugins: ['relativeTime', 'advancedFormat'],
  },
  googleAnalytics: {
    id: process.env.GOOGLE_ANALYTICS_ID || 'G-KBZQ6KNY8T'
  },
  robots: {
    UserAgent: '*',
    Allow: '/',
    Sitemap: (process.env.APP_URL || 'https://qdjr.me') + '/sitemap.xml'
  },
  sitemap: {
    hostname: process.env.APP_URL || 'https://qdjr.me',
    lastmod: (new Date().toISOString()),
    path: '/sitemap.xml',
    sitemaps: [
      {
        path: '/sitemap-base.xml',
        exclude: ['/search**'],
        routes: [
          {
            url: '',
            priority: 1,
            lastmod: (new Date().toISOString())
          },
          {
            url: '/blog',
            priority: 1,
            lastmod: (new Date().toISOString())
          },
          {
            url: '/about',
            priority: 1,
            lastmod: (new Date().toISOString())
          },
        ]
      },
      {
        path: '/sitemap-categories.xml',
        exclude: ['**'],
        routes: async () => {
          return await getCategories({perPage: 1000}).then(res => {
            if (res.status < 300 && res.data.data)
              return res.data.data.map(category => {
                return {
                  url: '/category/' + category.slug,
                  priority: 0.9,
                  lastmod: new Date(category.updated_at).toISOString()
                }
              })
            return []
          }).catch(err => {
            console.log(err)
            return []
          });
        }
      }, {
        path: '/sitemap-tags.xml',
        exclude: ['**'],
        routes: async () => {
          return await getTags({perPage: 1000}).then(res => {
            if (res.status < 300 && res.data.data)
              return res.data.data.map(tag => {
                return {
                  url: '/tag/' + tag.slug,
                  priority: 0.8,
                  lastmod: new Date(tag.updated_at).toISOString()
                }
              })
            return []
          }).catch(err => {
            console.log(err)
            return []
          });
        }
      },
      {
        path: '/sitemap-posts.xml',
        exclude: ['**'],
        routes: async () => {
          return await getPosts({perPage: 1000}).then(res => {
            if (res.status < 300 && res.data.data)
              return res.data.data.map(post => {
                return {
                  url: '/' + post.slug,
                  changefreq: 'daily',
                  priority: 0.7,
                  lastmod: new Date(post.published_at).toISOString(),
                  img: [
                    {
                      url: post.thumbnail,
                      caption: post.title,
                      title: post.title,
                      geoLocation: post.location || '',
                      license: process.env.APP_URL || 'https://qdjr.me',
                    }
                  ]
                }
              })
            return []
          }).catch(err => {
            console.log(err)
            return []
          });
        }
      }
    ]
  }
}
