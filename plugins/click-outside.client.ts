// Click outside directive for Nuxt 3 with TypeScript
// Client-side only plugin

interface ClickOutsideElement extends HTMLElement {
  __vueClickOutside__?: (e: Event) => void
}

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    nuxtApp.vueApp.directive('click-outside', {
      mounted(el: ClickOutsideElement, binding: any) {
        // Provided expression must evaluate to a function
        if (typeof binding.value !== 'function') {
          console.warn(`[Vue-click-outside:] provided expression '${binding.expression}' is not a function, but has to be`)
          return
        }

        // Define Handler and cache it on the element
        const bubble = binding.modifiers.bubble
        const handler = (e: Event) => {
          const target = e.target as Node
          if (bubble || (!el.contains(target) && el !== target)) {
            binding.value(e)
          }
        }
        el.__vueClickOutside__ = handler

        // Add Event Listeners
        document.addEventListener('click', handler)
      },

      unmounted(el: ClickOutsideElement) {
        // Remove Event Listeners
        if (el.__vueClickOutside__) {
          document.removeEventListener('click', el.__vueClickOutside__)
          el.__vueClickOutside__ = undefined
        }
      },

      // SSR-safe: provide empty getSSRProps
      getSSRProps() {
        return {}
      }
    })
  } else {
    // Server-side: register a no-op directive
    nuxtApp.vueApp.directive('click-outside', {
      getSSRProps() {
        return {}
      }
    })
  }
})
