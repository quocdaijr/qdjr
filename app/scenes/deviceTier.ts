/**
 * How much scene a device can afford, read once from the hardware hints the
 * browser exposes. Hints are coarse (deviceMemory is Chromium-only and capped
 * at 8), so VibeScene also watches real frame times with createFrameWatch.
 */
export type DeviceTier = 'high' | 'low' | 'minimal'

export interface DeviceHints {
  /** navigator.hardwareConcurrency */
  cores?: number
  /** navigator.deviceMemory, in GB; undefined outside Chromium */
  memoryGb?: number
  /** (pointer: coarse) — phones and tablets */
  coarse: boolean
  /** navigator.connection.saveData */
  saveData?: boolean
}

export interface TierSettings {
  detail: 'high' | 'low'
  antialias: boolean
  /** false: one frame per state change, like prefers-reduced-motion */
  animate: boolean
}

const MINIMAL_CORES = 2
const MINIMAL_MEMORY_GB = 2
const LOW_CORES = 4
const LOW_MEMORY_GB = 4

export const TIER_SETTINGS: Record<DeviceTier, TierSettings> = {
  high: {detail: 'high', antialias: true, animate: true},
  low: {detail: 'low', antialias: true, animate: true},
  minimal: {detail: 'low', antialias: false, animate: false}
}

const atMost = (value: number | undefined, limit: number) => value !== undefined && value > 0 && value <= limit

export function deviceTier({cores, memoryGb, coarse, saveData}: DeviceHints): DeviceTier {
  if (saveData || atMost(cores, MINIMAL_CORES) || atMost(memoryGb, MINIMAL_MEMORY_GB)) return 'minimal'
  if (coarse || atMost(cores, LOW_CORES) || atMost(memoryGb, LOW_MEMORY_GB)) return 'low'
  return 'high'
}

type HintedNavigator = Navigator & {deviceMemory?: number; connection?: {saveData?: boolean}}

const isTier = (value: string | null): value is DeviceTier => value !== null && Object.hasOwn(TIER_SETTINGS, value)

/** The live browser's tier. Dev builds take a ?tier=minimal|low|high override for testing. */
export function readDeviceTier(): DeviceTier {
  const forced = import.meta.dev ? new URLSearchParams(window.location.search).get('tier') : null
  if (isTier(forced)) return forced
  const nav = navigator as HintedNavigator
  return deviceTier({
    cores: nav.hardwareConcurrency,
    memoryGb: nav.deviceMemory,
    coarse: window.matchMedia('(pointer: coarse)').matches,
    saveData: nav.connection?.saveData
  })
}

const SLOW_FRAME_SECONDS = 1 / 20
const WATCH_WINDOW_SECONDS = 2

/**
 * Feed it each frame's dt; it answers true at the end of a ~2 s window whose
 * frames averaged slower than 20 fps.
 */
export function createFrameWatch(): (dt: number) => boolean {
  let total = 0
  let frames = 0
  return (dt) => {
    total += dt
    frames += 1
    if (total < WATCH_WINDOW_SECONDS) return false
    const isSlow = total / frames > SLOW_FRAME_SECONDS
    total = 0
    frames = 0
    return isSlow
  }
}
