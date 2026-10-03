// Theme = vibe (user choice, persisted) + dark mode (derived from the Vietnam
// clock, never persisted, no manual toggle).
import {defineStore} from 'pinia'
import {isNightInVietnam} from '~/utils/vnTime'

export type Vibe = 'terminal' | 'cartoon' | 'galaxy'

// Cartoon first and the default; the coding (terminal) vibe last.
export const VIBES: readonly Vibe[] = ['cartoon', 'galaxy', 'terminal'] as const
export const DEFAULT_VIBE: Vibe = 'cartoon'
export const VIBE_STORAGE_KEY = 'vibe'

const CLOCK_INTERVAL_MS = 60_000

export function isVibe(value: unknown): value is Vibe {
  return typeof value === 'string' && (VIBES as readonly string[]).includes(value)
}

export interface ThemeState {
  vibe: Vibe
  isDarkMode: boolean
  isInitialized: boolean
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    vibe: DEFAULT_VIBE,
    isDarkMode: false,
    isInitialized: false
  }),

  getters: {
    currentTheme: (state): 'dark' | 'light' => (state.isDarkMode ? 'dark' : 'light'),
    logoSrc: (state): string => (state.isDarkMode ? '/logo-dark.svg' : '/logo.svg')
  },

  actions: {
    // Restore the saved vibe (if valid) and evaluate the clock once.
    initializeTheme(now: Date = new Date()) {
      if (import.meta.client && !this.isInitialized) {
        const saved = localStorage.getItem(VIBE_STORAGE_KEY)
        this.vibe = isVibe(saved) ? saved : DEFAULT_VIBE
        this.isDarkMode = isNightInVietnam(now)
        this.applyTheme()
        this.isInitialized = true
      }
    },

    setVibe(vibe: Vibe) {
      if (!isVibe(vibe)) return
      this.vibe = vibe
      if (import.meta.client) localStorage.setItem(VIBE_STORAGE_KEY, vibe)
      this.applyTheme()
    },

    nextVibe() {
      const index = VIBES.indexOf(this.vibe)
      this.setVibe(VIBES[(index + 1) % VIBES.length])
    },

    // Re-evaluate dark mode. Called once a minute by startClock().
    syncClock(now: Date = new Date()) {
      this.isDarkMode = isNightInVietnam(now)
      this.applyTheme()
    },

    applyTheme() {
      if (import.meta.client) {
        const html = document.documentElement
        html.classList.toggle('dark', this.isDarkMode)
        html.dataset.vibe = this.vibe
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
