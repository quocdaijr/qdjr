import {describe, expect, test} from 'vitest'
import {pointInRect, rectsOverlap, type Rect} from '~/scenes/cartoon/footprint'

const square = (x: number, z: number, angle = 0, half = 1): Rect => ({x, z, angle, hx: half, hz: half})

describe('footprint geometry', () => {
  test('pointInRect respects rotation and margin', () => {
    const r: Rect = {x: 0, z: 0, angle: Math.PI / 2, hx: 2, hz: 0.5} // long axis turned onto z
    expect(pointInRect(r, 0, 1.9)).toBe(true)
    expect(pointInRect(r, 1.9, 0)).toBe(false)
    expect(pointInRect(r, 0.8, 0, 0.4)).toBe(true)
  })

  test('rectsOverlap separates, touches and rotates correctly', () => {
    expect(rectsOverlap(square(0, 0), square(3, 0))).toBe(false)
    expect(rectsOverlap(square(0, 0), square(1.9, 0))).toBe(true)
    // A 45° square reaches √2 ≈ 1.41 along x, so it overlaps at 2.3 but not at 2.5.
    expect(rectsOverlap(square(0, 0), square(2.3, 0, Math.PI / 4))).toBe(true)
    expect(rectsOverlap(square(0, 0), square(2.5, 0, Math.PI / 4))).toBe(false)
  })
})
