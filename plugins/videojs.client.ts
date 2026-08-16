// Video.js plugin for Nuxt 3 with TypeScript
// Client-side only plugin

import videojs from 'video.js'
import 'video.js/dist/video-js.min.css'
import '@/assets/sass/video-js-custom.sass'

export default defineNuxtPlugin(() => {
  // No client guard needed — this file is already .client.ts.
  return {
    provide: {
      videojs
    }
  }
})
