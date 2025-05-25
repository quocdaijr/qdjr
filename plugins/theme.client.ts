// Theme initialization plugin for Nuxt 3
export default defineNuxtPlugin(() => {
  const themeStore = useThemeStore()
  
  // Initialize theme on app startup
  themeStore.initializeTheme()
  
  // Watch for system theme changes
  themeStore.watchSystemTheme()
})
