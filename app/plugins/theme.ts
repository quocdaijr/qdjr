import {isVibe, useThemeStore, VIBE_STORAGE_KEY} from '~/stores/theme'
import {isNightInVietnam} from '~/utils/vnTime'

// Theme bootstrap. The server renders the vibe from the cookie (it cannot see
// localStorage) and dark mode from the Vietnam clock; the client hydrates with
// the same values, then restores the saved vibe and keeps the clock ticking.
export default defineNuxtPlugin((nuxtApp) => {
  const themeStore = useThemeStore()
  const cookie = useCookie(VIBE_STORAGE_KEY)
  if (isVibe(cookie.value)) themeStore.vibe = cookie.value
  themeStore.isDarkMode = isNightInVietnam(new Date())
  // nuxt.config ships data-vibe="cartoon"; this entry overrides it on the
  // server and keeps unhead from re-applying the default after a reload.
  useHead({htmlAttrs: {'data-vibe': () => themeStore.vibe, class: () => (themeStore.isDarkMode ? 'dark' : undefined)}})
  if (import.meta.server) return
  nuxtApp.hook('app:suspense:resolve', () => {
    themeStore.initializeTheme()
    themeStore.startClock()
  })
})
