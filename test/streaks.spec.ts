import {describe, expect, test} from 'vitest'
import {isDone, nextAmbientDelay, streakPoint, type Streak} from '~/scenes/galaxy/streaks'

const S: Streak = {from: [0, 0, 0], to: [10, -5, 0], start: 2, duration: 1}

describe('streak motion', () => {
  test('starts at from, ends at to, never overshoots', () => {
    expect(streakPoint(S, 1)).toEqual([0, 0, 0])
    expect(streakPoint(S, 2)).toEqual([0, 0, 0])
    expect(streakPoint(S, 3)).toEqual([10, -5, 0])
    expect(streakPoint(S, 9)).toEqual([10, -5, 0])
    const mid = streakPoint(S, 2.5)
    expect(mid[0]).toBeGreaterThan(5) // eases out: fast start
    expect(mid[0]).toBeLessThan(10)
  })

  test('is done once its duration has passed', () => {
    expect(isDone(S, 2.99)).toBe(false)
    expect(isDone(S, 3)).toBe(true)
  })

  test('ambient streaks come every few seconds', () => {
    expect(nextAmbientDelay(() => 0)).toBe(2.5)
    expect(nextAmbientDelay(() => 0.999)).toBeLessThan(6)
  })
})
