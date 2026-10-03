import {describe, expect, test} from 'vitest'
import {roadProfile} from '~/scenes/trip/profile'

describe('roadProfile', () => {
  test('scales metres to world units and smooths the noise of the elevation model', () => {
    const out = roadProfile([0, 0, 100, 0, 0], [], {scale: 0.01, window: 1})
    expect(out).toHaveLength(5)
    expect(out[2]).toBeCloseTo(100 / 3 * 0.01, 6)
    expect(out[0]).toBe(0)
  })

  test('runs straight through a tunnel and level over a bridge', () => {
    // A mountain over the tunnel (points 2–4) and a river under the bridge (points 6–8).
    const elevation = [10, 10, 10, 300, 10, 10, 20, -5, 20, 20]
    const spans = [
      {kind: 'tunnel' as const, from: 2 / 9, to: 4 / 9},
      {kind: 'bridge' as const, from: 6 / 9, to: 8 / 9}
    ]
    const out = roadProfile(elevation, spans, {scale: 1, window: 0})
    expect(out[3]).toBeCloseTo(10, 6)
    expect(out[7]).toBeCloseTo(20, 6)
  })

  test('ignores spans of other kinds', () => {
    expect(roadProfile([0, 50, 0], [{kind: 'city', from: 0, to: 1}], {scale: 1, window: 0})).toEqual([0, 50, 0])
  })
})
