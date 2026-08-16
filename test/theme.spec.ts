import {beforeEach, describe, expect, test, vi} from 'vitest'
import {useThemeStore} from '~/stores/theme'

/**
 * Install a matchMedia stub, since happy-dom does not implement it.
 * Returns a handle for firing a system theme change.
 */
function stubMatchMedia(prefersDark: boolean) {
  const listeners: Array<(e: {matches: boolean}) => void> = []

  window.matchMedia = vi.fn().mockReturnValue({
    matches: prefersDark,
    addEventListener: (_: string, cb: (e: {matches: boolean}) => void) => listeners.push(cb),
    removeEventListener: () => {}
  }) as unknown as typeof window.matchMedia

  return {
    emit(matches: boolean) {
      listeners.forEach((cb) => cb({matches}))
    }
  }
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
  stubMatchMedia(false)
})

describe('theme store', () => {
  test('starts light and uninitialised', () => {
    const store = useThemeStore()
    expect(store.isDarkMode).toBe(false)
    expect(store.isInitialized).toBe(false)
    expect(store.currentTheme).toBe('light')
  })

  test('restores a saved dark preference from localStorage', () => {
    localStorage.setItem('isDarkMode', 'true')

    const store = useThemeStore()
    store.initializeTheme()

    expect(store.isDarkMode).toBe(true)
    expect(store.isInitialized).toBe(true)
    // The Tailwind v4 `dark` variant keys off this class on <html>.
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  test('restores a saved light preference even when the system prefers dark', () => {
    stubMatchMedia(true)
    localStorage.setItem('isDarkMode', 'false')

    const store = useThemeStore()
    store.initializeTheme()

    expect(store.isDarkMode).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  test('falls back to the system preference when nothing is saved', () => {
    stubMatchMedia(true)

    const store = useThemeStore()
    store.initializeTheme()

    expect(store.isDarkMode).toBe(true)
  })

  test('does not re-initialise once initialised', () => {
    const store = useThemeStore()
    store.initializeTheme()

    // A later external write must not be picked up by a second call.
    localStorage.setItem('isDarkMode', 'true')
    store.initializeTheme()

    expect(store.isDarkMode).toBe(false)
  })

  test('toggleTheme flips, persists and applies', () => {
    const store = useThemeStore()

    store.toggleTheme()
    expect(store.isDarkMode).toBe(true)
    expect(localStorage.getItem('isDarkMode')).toBe('true')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    store.toggleTheme()
    expect(store.isDarkMode).toBe(false)
    expect(localStorage.getItem('isDarkMode')).toBe('false')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  test('setTheme sets an explicit value', () => {
    const store = useThemeStore()

    store.setTheme(true)
    expect(store.isDarkMode).toBe(true)
    expect(localStorage.getItem('isDarkMode')).toBe('true')

    store.setTheme(false)
    expect(store.isDarkMode).toBe(false)
  })

  test('exposes the matching logo for the current theme', () => {
    const store = useThemeStore()
    expect(store.logoSrc).toBe('/logo.svg')

    store.setTheme(true)
    expect(store.logoSrc).toBe('/logo-dark.svg')
    expect(store.currentTheme).toBe('dark')
  })

  test('follows later system changes while no preference is saved', () => {
    const media = stubMatchMedia(false)

    const store = useThemeStore()
    store.watchSystemTheme()

    media.emit(true)

    expect(store.isDarkMode).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  test('ignores system changes once the user has chosen', () => {
    const media = stubMatchMedia(false)

    const store = useThemeStore()
    store.watchSystemTheme()
    store.setTheme(false) // writes to localStorage

    media.emit(true)

    expect(store.isDarkMode).toBe(false)
  })
})
