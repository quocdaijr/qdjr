// Theme bootstrap: restore the saved vibe, evaluate the Vietnam clock once,
// then keep re-evaluating it every minute for the life of the tab.
export default defineNuxtPlugin(() => {
  const themeStore = useThemeStore()
  themeStore.initializeTheme()
  themeStore.startClock()
})
