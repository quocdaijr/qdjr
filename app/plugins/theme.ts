import {isMode, isVibe, MODE_STORAGE_KEY, useThemeStore, VIBE_STORAGE_KEY} from '~/stores/theme'
import {isNightInVietnam} from '~/utils/vnTime'

// Vibe fonts, vibes mode only. Three static stylesheets (one per vibe): the
// browser downloads binaries only for text it renders, so the inactive vibes
// cost one small CSS fetch each. CV mode uses the system stack and loads none.
const VIBE_FONT_LINKS = [
  {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap'},
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,700,100,1&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600&display=swap'
  },
  {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@600&family=Geist:wght@400;600&family=Geist+Mono:wght@400&display=swap'}
]
const SCHEME_QUERY = '(prefers-color-scheme: dark)'

// Theme bootstrap. A server render takes mode and vibe from their cookies (it
// cannot see localStorage); dark mode comes from the Vietnam clock in vibes
// mode and is left light in cv mode (tokens.css paints dark from the OS media
// query before any script runs). A prerendered page (static hosting) is built
// once for everyone, so it keeps the defaults. The client hydrates from Pinia's
// payload, restores the saved choices and keeps the clock / scheme in sync.
export default defineNuxtPlugin((nuxtApp) => {
  const themeStore = useThemeStore()
  if (import.meta.server && !import.meta.prerender) {
    const mode = useCookie(MODE_STORAGE_KEY)
    if (isMode(mode.value)) themeStore.mode = mode.value
    const vibe = useCookie(VIBE_STORAGE_KEY)
    if (isVibe(vibe.value)) themeStore.vibe = vibe.value
    themeStore.isDarkMode = themeStore.mode === 'vibes' && isNightInVietnam(new Date())
  }
  // nuxt.config ships the default data-mode; these entries override it on the
  // server and keep unhead from re-applying the default on reload. data-vibe
  // has no config default on purpose (undefined here must mean "absent").
  useHead({
    htmlAttrs: {
      'data-mode': () => themeStore.mode,
      'data-vibe': () => (themeStore.mode === 'vibes' ? themeStore.vibe : undefined),
      class: () => (themeStore.isDarkMode ? 'dark' : undefined)
    },
    link: () => (themeStore.mode === 'vibes' ? VIBE_FONT_LINKS : [])
  })
  if (import.meta.server) return
  nuxtApp.hook('app:suspense:resolve', () => {
    const scheme = window.matchMedia(SCHEME_QUERY)
    themeStore.initializeTheme(new Date(), scheme.matches)
    themeStore.startClock()
    scheme.addEventListener('change', (event) => themeStore.syncScheme(event.matches))
  })
})
