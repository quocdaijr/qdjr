import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'
import {DEFAULT_MODE, DEFAULT_VIBE, MODES, MODE_STORAGE_KEY, VIBES, VIBE_STORAGE_KEY, isMode, isVibe, useThemeStore} from '~/stores/theme'

// 12:00 and 22:00 Vietnam time, expressed in UTC (UTC+7).
const VN_NOON = new Date(Date.UTC(2026, 9, 1, 5, 0))
const VN_NIGHT = new Date(Date.UTC(2026, 9, 1, 15, 0))

const html = () => document.documentElement

beforeEach(() => {
  localStorage.clear()
  html().classList.remove('dark')
  delete html().dataset.vibe
  delete html().dataset.mode
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
    expect(document.cookie).toContain(`${VIBE_STORAGE_KEY}=galaxy`) // mirrored for the server render
  })

  test('without a saved vibe keeps the one it already has (from the cookie)', () => {
    const store = useThemeStore()
    store.vibe = 'terminal'
    store.initializeTheme(VN_NOON)

    expect(store.vibe).toBe('terminal')
    expect(localStorage.getItem(VIBE_STORAGE_KEY)).toBe('terminal')
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
    expect(document.cookie).toContain(`${VIBE_STORAGE_KEY}=cartoon`)
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

describe('mode helpers', () => {
  test('isMode accepts only cv and vibes', () => {
    MODES.forEach((m) => expect(isMode(m)).toBe(true))
    expect(isMode('pro')).toBe(false)
    expect(isMode(undefined)).toBe(false)
  })
})

describe('mode', () => {
  test('starts on the default mode', () => {
    expect(useThemeStore().mode).toBe(DEFAULT_MODE)
  })

  test('initializeTheme restores a saved mode, mirrors it to the cookie and applies data-mode', () => {
    localStorage.setItem(MODE_STORAGE_KEY, 'cv')
    const store = useThemeStore()
    store.initializeTheme(VN_NOON)
    expect(store.mode).toBe('cv')
    expect(html().dataset.mode).toBe('cv')
    expect(document.cookie).toContain(`${MODE_STORAGE_KEY}=cv`)
  })

  test('a saved vibe alone does not change the mode', () => {
    localStorage.setItem(VIBE_STORAGE_KEY, 'galaxy')
    const store = useThemeStore()
    store.initializeTheme(VN_NOON)
    expect(store.mode).toBe(DEFAULT_MODE)
    expect(store.vibe).toBe('galaxy')
  })

  test('cv mode drops data-vibe from <html> and vibes mode puts it back', () => {
    const store = useThemeStore()
    store.setMode('cv')
    expect(html().dataset.mode).toBe('cv')
    expect(html().dataset.vibe).toBeUndefined()
    store.setMode('vibes')
    expect(html().dataset.mode).toBe('vibes')
    expect(html().dataset.vibe).toBe(store.vibe)
  })

  test('toggleMode flips between the two modes and persists', () => {
    const store = useThemeStore()
    store.setMode('cv')
    store.toggleMode()
    expect(store.mode).toBe('vibes')
    expect(localStorage.getItem(MODE_STORAGE_KEY)).toBe('vibes')
    store.toggleMode()
    expect(store.mode).toBe('cv')
  })

  test('in cv mode dark follows the OS scheme, not the clock', () => {
    localStorage.setItem(MODE_STORAGE_KEY, 'cv')
    const store = useThemeStore()
    store.initializeTheme(VN_NIGHT, false)
    expect(store.isDarkMode).toBe(false)
    store.syncClock(VN_NIGHT)
    expect(store.isDarkMode).toBe(false)
    store.syncScheme(true)
    expect(store.isDarkMode).toBe(true)
    expect(html().classList.contains('dark')).toBe(true)
  })

  test('in vibes mode syncScheme is ignored and the clock rules', () => {
    localStorage.setItem(MODE_STORAGE_KEY, 'vibes')
    const store = useThemeStore()
    store.initializeTheme(VN_NOON, true)
    expect(store.isDarkMode).toBe(false)
    store.syncScheme(true)
    expect(store.isDarkMode).toBe(false)
  })

  test('isCv and isVibes mirror the mode', () => {
    const store = useThemeStore()
    store.setMode('cv')
    expect(store.isCv).toBe(true)
    expect(store.isVibes).toBe(false)
    store.setMode('vibes')
    expect(store.isCv).toBe(false)
    expect(store.isVibes).toBe(true)
  })

  test('setMode ignores values that are not a mode', () => {
    const store = useThemeStore()
    store.setMode('pro' as never)
    expect(store.mode).toBe(DEFAULT_MODE)
  })
})
