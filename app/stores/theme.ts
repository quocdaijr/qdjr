// Theme = mode (cv | vibes, persisted) + vibe (user choice, persisted) + dark
// mode (never persisted, no manual toggle: the Vietnam clock in vibes mode,
// the OS colour scheme in cv mode).
import {defineStore} from 'pinia'
import {isNightInVietnam} from '~/utils/vnTime'

export type Vibe = 'terminal' | 'cartoon' | 'galaxy'

// Cartoon first and the default; the coding (terminal) vibe last.
export const VIBES: readonly Vibe[] = ['cartoon', 'galaxy', 'terminal'] as const
export const DEFAULT_VIBE: Vibe = 'cartoon'
export const VIBE_STORAGE_KEY = 'vibe'

// Presentation mode: the plain CV (fast, no scene) or the three.js vibes.
export type Mode = 'cv' | 'vibes'
export const MODES: readonly Mode[] = ['cv', 'vibes'] as const
export const DEFAULT_MODE: Mode = 'cv' // the plain CV by default; the vibes are one switch away
export const MODE_STORAGE_KEY = 'mode'

const CLOCK_INTERVAL_MS = 60_000
export const SCHEME_QUERY = '(prefers-color-scheme: dark)'
const COOKIE_MAX_AGE_S = 60 * 60 * 24 * 365

// localStorage is the client's record; a cookie mirrors it so the server
// renders the same mode and vibe (plugins/theme.ts).
function persist(key: string, value: string) {
  localStorage.setItem(key, value)
  document.cookie = `${key}=${value}; path=/; max-age=${COOKIE_MAX_AGE_S}; samesite=lax`
}

export function isVibe(value: unknown): value is Vibe {
  return typeof value === 'string' && (VIBES as readonly string[]).includes(value)
}

export function isMode(value: unknown): value is Mode {
  return typeof value === 'string' && (MODES as readonly string[]).includes(value)
}

export interface ThemeState {
  mode: Mode
  vibe: Vibe
  isDarkMode: boolean
  isInitialized: boolean
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    mode: DEFAULT_MODE,
    vibe: DEFAULT_VIBE,
    isDarkMode: false,
    isInitialized: false
  }),

  getters: {
    isCv: (state): boolean => state.mode === 'cv',
    isVibes: (state): boolean => state.mode === 'vibes',
    currentTheme: (state): 'dark' | 'light' => (state.isDarkMode ? 'dark' : 'light'),
    logoSrc: (state): string => (state.isDarkMode ? '/logo-dark.svg' : '/logo.svg')
  },

  actions: {
    // Restore the saved mode and vibe (if valid) and evaluate dark mode once:
    // the clock in vibes mode, the OS scheme (prefersDark) in cv mode.
    initializeTheme(now: Date = new Date(), prefersDark = false) {
      if (import.meta.client && !this.isInitialized) {
        const savedMode = localStorage.getItem(MODE_STORAGE_KEY)
        this.mode = isMode(savedMode) ? savedMode : this.mode
        persist(MODE_STORAGE_KEY, this.mode)
        const saved = localStorage.getItem(VIBE_STORAGE_KEY)
        this.vibe = isVibe(saved) ? saved : this.vibe
        persist(VIBE_STORAGE_KEY, this.vibe)
        this.isDarkMode = this.mode === 'cv' ? prefersDark : isNightInVietnam(now)
        this.applyTheme()
        this.isInitialized = true
      }
    },

    // Switching also re-derives dark mode under the new rule (OS scheme for
    // cv, the clock for vibes) so a night-time visitor leaving the vibes does
    // not keep a dark CV on a light OS until the next reload.
    setMode(mode: Mode) {
      if (!isMode(mode)) return
      this.mode = mode
      if (import.meta.client) {
        persist(MODE_STORAGE_KEY, mode)
        this.isDarkMode = mode === 'cv' ? window.matchMedia(SCHEME_QUERY).matches : isNightInVietnam(new Date())
      }
      this.applyTheme()
    },

    toggleMode() {
      this.setMode(this.mode === 'cv' ? 'vibes' : 'cv')
    },

    setVibe(vibe: Vibe) {
      if (!isVibe(vibe)) return
      this.vibe = vibe
      if (import.meta.client) persist(VIBE_STORAGE_KEY, vibe)
      this.applyTheme()
    },

    nextVibe() {
      const index = VIBES.indexOf(this.vibe)
      this.setVibe(VIBES[(index + 1) % VIBES.length])
    },

    // Vibes mode: dark follows the Vietnam clock (called once a minute by
    // startClock()). CV mode: the OS scheme (syncScheme).
    syncClock(now: Date = new Date()) {
      if (this.mode !== 'vibes') return
      this.isDarkMode = isNightInVietnam(now)
      this.applyTheme()
    },

    syncScheme(prefersDark: boolean) {
      if (this.mode !== 'cv') return
      this.isDarkMode = prefersDark
      this.applyTheme()
    },

    applyTheme() {
      if (import.meta.client) {
        const html = document.documentElement
        html.classList.toggle('dark', this.isDarkMode)
        html.dataset.mode = this.mode
        if (this.mode === 'vibes') html.dataset.vibe = this.vibe
        else delete html.dataset.vibe
      }
    },

    // Returns a stop function so callers (and tests) can clear the interval.
    startClock(intervalMs: number = CLOCK_INTERVAL_MS): () => void {
      let stop = () => {}
      if (import.meta.client) {
        const id = setInterval(() => this.syncClock(), intervalMs)
        stop = () => clearInterval(id)
      }
      return stop
    }
  }
})
