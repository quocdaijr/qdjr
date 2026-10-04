// Click outside directive for Nuxt 3 with TypeScript
// Universal: the server needs the directive registered (getSSRProps) to render templates that use it

interface ClickOutsideElement extends HTMLElement {
  __vueClickOutside__?: (e: Event) => void
}

export default defineNuxtPlugin((nuxtApp) => {
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
        // Use composedPath() rather than el.contains(e.target). The path is captured when
        // the event is dispatched, so it stays correct even if a re-render triggered by an
        // earlier listener detaches e.target mid-propagation — as happens when a click
        // toggles a v-if inside this element (an icon swap, for example). With `contains`,
        // a detached target looks like a click outside and closes the thing that just opened.
        const path = e.composedPath()
        if (bubble || !path.includes(el)) {
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
})
