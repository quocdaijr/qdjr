// Theme bootstrap: restore the saved vibe, evaluate the Vietnam clock once,
// then keep re-evaluating it every minute for the life of the tab.
export default defineNuxtPlugin(() => {
  const themeStore = useThemeStore()
  themeStore.initializeTheme()
  themeStore.startClock()
  // nuxt.config ships data-vibe="cartoon" in the page shell; unhead re-applies
  // it once mounted, so the live vibe must be a head entry too or a saved vibe
  // is reset to cartoon after a reload.
  useHead({htmlAttrs: {'data-vibe': () => themeStore.vibe}})
})
