// Vue Particles plugin for Nuxt 3 with TypeScript
// Client-side only plugin

import Particles from "@tsparticles/vue3"
import { loadSlim } from "@tsparticles/slim"

export default defineNuxtPlugin((nuxtApp) => {
  // No client guard needed — this file is already .client.ts.
  nuxtApp.vueApp.use(Particles, {
    init: async (engine) => {
      await loadSlim(engine)
    }
  })
})
