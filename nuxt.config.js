export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'QDJr Blog',
    meta: [
      {charset: 'utf-8'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1'},
      {
        hid: 'description',
        name: 'description',
        content: 'This is a small blog of Nguyen Quoc Dai'},
      {
        hid: 'keywords',
        name: 'keywords',
        content: 'development, software, qdjr, quocdaijr, nguyen quoc dai, blog'
      },
      {
        hid: 'og:type',
        property: 'og:type',
        content: 'article'
      },
      {
        hid: 'og:site_name',
        name: 'og:site_name',
        content: 'QDJr'},
      {
        hid: 'og:title',
        name: 'og:title',
        content: 'QDJr Blog'},
      {
        hid: 'og:description',
        name: 'og:description',
        content: 'This is a small blog of Nguyen Quoc Dai'},
      {
        hid: 'og:image',
        name: 'og:image',
        content: (process.env.APP_URL || 'https://qdjr.me') + '/logo.svg',

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
    {
      src: '~/plugins/prism'
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
}
