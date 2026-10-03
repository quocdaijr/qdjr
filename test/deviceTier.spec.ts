import {describe, expect, test} from 'vitest'
import {createFrameWatch, deviceTier, TIER_SETTINGS} from '~/scenes/deviceTier'

describe('deviceTier', () => {
  test('a desktop with plenty of cores and memory gets the full scene', () => {
    expect(deviceTier({cores: 8, memoryGb: 8, coarse: false})).toBe('high')
  })

  test('missing deviceMemory (Safari, Firefox) is ignored, not treated as weak', () => {
    expect(deviceTier({cores: 8, coarse: false})).toBe('high')
    expect(deviceTier({coarse: false})).toBe('high')
  })

  test('touch devices and mid-range hardware get the lighter scene', () => {
    expect(deviceTier({cores: 8, memoryGb: 8, coarse: true})).toBe('low')
    expect(deviceTier({cores: 4, memoryGb: 8, coarse: false})).toBe('low')
    expect(deviceTier({cores: 8, memoryGb: 4, coarse: false})).toBe('low')
  })

  test('two cores, two gigabytes or data saver get a still scene', () => {
    expect(deviceTier({cores: 2, memoryGb: 8, coarse: false})).toBe('minimal')
    expect(deviceTier({cores: 8, memoryGb: 2, coarse: false})).toBe('minimal')
    expect(deviceTier({cores: 8, memoryGb: 8, coarse: false, saveData: true})).toBe('minimal')
  })

  test('only the minimal tier stops the animation loop', () => {
    expect(TIER_SETTINGS.high.animate).toBe(true)
    expect(TIER_SETTINGS.low.animate).toBe(true)
    expect(TIER_SETTINGS.minimal.animate).toBe(false)
  })
})

describe('createFrameWatch', () => {
  const run = (dt: number, frames: number) => {
    const watch = createFrameWatch()
    return Array.from({length: frames}, () => watch(dt))
  }

  test('stays quiet at 60 fps', () => {
    expect(run(1 / 60, 600)).not.toContain(true)
  })

  test('reports once per window when frames average under 20 fps', () => {
    const verdicts = run(1 / 15, 70) // ~4.7 s at 15 fps: two full 2 s windows
    expect(verdicts.filter(Boolean)).toHaveLength(2)
  })

  test('says nothing before a full window has passed', () => {
    expect(run(1 / 10, 10)).not.toContain(true) // 1 s
  })
})
