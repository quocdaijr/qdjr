// Vue Particles plugin for Nuxt 3 with TypeScript
// Client-side only plugin

import Particles from "@tsparticles/vue3"
import { loadSlim } from "@tsparticles/slim"

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    nuxtApp.vueApp.use(Particles, {
      init: async (engine) => {
        await loadSlim(engine)
      }
    })
  }
})
