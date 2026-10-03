import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'
import {DEFAULT_VIBE, VIBES, VIBE_STORAGE_KEY, isVibe, useThemeStore} from '~/stores/theme'

// 12:00 and 22:00 Vietnam time, expressed in UTC (UTC+7).
const VN_NOON = new Date(Date.UTC(2026, 9, 1, 5, 0))
const VN_NIGHT = new Date(Date.UTC(2026, 9, 1, 15, 0))

const html = () => document.documentElement

beforeEach(() => {
  localStorage.clear()
  html().classList.remove('dark')
  delete html().dataset.vibe
})

afterEach(() => {
  vi.useRealTimers()
})

describe('vibe helpers', () => {
  test('isVibe accepts only the three vibes', () => {
    VIBES.forEach((v) => expect(isVibe(v)).toBe(true))
    expect(isVibe('neon')).toBe(false)
    expect(isVibe(null)).toBe(false)
    expect(isVibe(undefined)).toBe(false)
  })
})

describe('theme store', () => {
  test('starts on the default vibe, light, uninitialised', () => {
    const store = useThemeStore()
    expect(store.vibe).toBe(DEFAULT_VIBE)
    expect(store.isDarkMode).toBe(false)
    expect(store.isInitialized).toBe(false)
    expect(store.currentTheme).toBe('light')
  })

  test('initializeTheme restores a saved vibe and applies it to <html>', () => {
    localStorage.setItem(VIBE_STORAGE_KEY, 'galaxy')

    const store = useThemeStore()
    store.initializeTheme(VN_NOON)

    expect(store.vibe).toBe('galaxy')
    expect(html().dataset.vibe).toBe('galaxy')
    expect(store.isInitialized).toBe(true)
  })

  test('ignores an unknown saved vibe', () => {
    localStorage.setItem(VIBE_STORAGE_KEY, 'neon')

    const store = useThemeStore()
    store.initializeTheme(VN_NOON)

    expect(store.vibe).toBe(DEFAULT_VIBE)
    expect(html().dataset.vibe).toBe(DEFAULT_VIBE)
  })

  test('derives light mode from the Vietnam clock at noon', () => {
    const store = useThemeStore()
    store.initializeTheme(VN_NOON)

    expect(store.isDarkMode).toBe(false)
    expect(html().classList.contains('dark')).toBe(false)
  })

  test('derives dark mode from the Vietnam clock at night', () => {
    const store = useThemeStore()
    store.initializeTheme(VN_NIGHT)

    expect(store.isDarkMode).toBe(true)
    expect(html().classList.contains('dark')).toBe(true)
    expect(store.currentTheme).toBe('dark')
    expect(store.logoSrc).toBe('/logo-dark.svg')
  })

  test('does not re-initialise once initialised', () => {
    const store = useThemeStore()
    store.initializeTheme(VN_NOON)

    localStorage.setItem(VIBE_STORAGE_KEY, 'cartoon')
    store.initializeTheme(VN_NOON)

    expect(store.vibe).toBe(DEFAULT_VIBE)
  })

  test('setVibe persists and applies', () => {
    const store = useThemeStore()

    store.setVibe('cartoon')

    expect(store.vibe).toBe('cartoon')
    expect(localStorage.getItem(VIBE_STORAGE_KEY)).toBe('cartoon')
    expect(html().dataset.vibe).toBe('cartoon')
  })

  test('setVibe ignores values that are not a vibe', () => {
    const store = useThemeStore()

    store.setVibe('neon' as never)

    expect(store.vibe).toBe(DEFAULT_VIBE)
    expect(localStorage.getItem(VIBE_STORAGE_KEY)).toBeNull()
  })

  test('cartoon is the default vibe and the coding (terminal) vibe comes last', () => {
    expect(DEFAULT_VIBE).toBe('cartoon')
    expect(VIBES).toEqual(['cartoon', 'galaxy', 'terminal'])
  })

  test('nextVibe cycles through all vibes and wraps', () => {
    const store = useThemeStore()

    store.nextVibe()
    expect(store.vibe).toBe('galaxy')
    store.nextVibe()
    expect(store.vibe).toBe('terminal')
    store.nextVibe()
    expect(store.vibe).toBe('cartoon')
  })

  test('syncClock re-evaluates dark mode for a given instant', () => {
    const store = useThemeStore()
    store.initializeTheme(VN_NOON)

    store.syncClock(VN_NIGHT)

    expect(store.isDarkMode).toBe(true)
    expect(html().classList.contains('dark')).toBe(true)
  })

  test('startClock ticks on the interval and the returned function stops it', () => {
    vi.useFakeTimers()
    vi.setSystemTime(VN_NOON)
    const store = useThemeStore()
    store.initializeTheme()
    expect(store.isDarkMode).toBe(false)

    const stop = store.startClock(60_000)
    vi.setSystemTime(VN_NIGHT)
    vi.advanceTimersByTime(60_000)
    expect(store.isDarkMode).toBe(true)

    stop()
    vi.setSystemTime(VN_NOON)
    vi.advanceTimersByTime(60_000)
    expect(store.isDarkMode).toBe(true) // no longer ticking
  })
})
