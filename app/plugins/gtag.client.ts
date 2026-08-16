// Google Analytics plugin for Nuxt 3 with TypeScript
// Client-side only plugin

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const gaId = config.public.gaId

  if (!gaId) {
    console.warn('Google Analytics ID not found in runtime config')
    return
  }

  // Load Google Analytics script
  useHead({
    script: [
      {
        src: `https://www.googletagmanager.com/gtag/js?id=${gaId}`,
        async: true
      }
    ]
  })

  // Initialize gtag. The `process.client` guard that used to wrap this block was
  // redundant — this file is already .client.ts — and it wrapped the `return`
  // too, so `provide` must stay at the top level here or $gtag disappears.
  window.dataLayer = window.dataLayer || []

  function gtag(...args: any[]) {
    window.dataLayer.push(args)
  }

  gtag('js', new Date())
  gtag('config', gaId)

  // Provide gtag function globally
  return {
    provide: {
      gtag
    }
  }
})

// Extend global window interface for TypeScript
declare global {
  interface Window {
    dataLayer: any[]
  }
}
