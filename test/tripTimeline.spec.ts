import {describe, expect, test} from 'vitest'
import {buildTimeline, driveBetween, legAt, tripMarks} from '~/scenes/trip/timeline'

// Stops at 0, 0.5 and 1 and a sight at 0.25 on a 100-unit road.
const MARKS = [
  {at: 0, dwell: 2},
  {at: 0.25, dwell: 1},
  {at: 0.5, dwell: 2},
  {at: 1, dwell: 3}
]
const timeline = buildTimeline(MARKS, {length: 100, cruise: 4})

describe('buildTimeline', () => {
  test('waits at the start, then eases away', () => {
    expect(timeline.at(1)).toMatchObject({u: 0, mark: 0, speed: 0})
    const early = timeline.at(2.5)
    expect(early.u).toBeGreaterThan(0)
    expect(early.u).toBeLessThan(0.02)
  })

  test('never passes the cruising speed and stands still at every mark', () => {
    let t = 0
    let reached = -1
    while (t < timeline.total) {
      const p = timeline.at(t)
      expect(p.speed).toBeLessThanOrEqual(4 + 1e-9)
      reached = Math.max(reached, p.mark)
      t += 0.05
    }
    expect(reached).toBe(3)
  })

  test('reaches each mark exactly and dwells there', () => {
    // 25 units at a peak of 4 units/s with a sine ease takes π/2 · 25 / 4 s.
    const leg = (Math.PI / 2) * 25 / 4
    const arrive = 2 + leg
    expect(timeline.at(arrive + 0.5)).toMatchObject({u: 0.25, mark: 1, speed: 0})
  })

  test('loops back to the start after the final pause', () => {
    expect(timeline.at(timeline.total + 1)).toMatchObject({u: 0, mark: 0})
    expect(timeline.at(timeline.total - 1)).toMatchObject({u: 1, mark: 3})
  })

  test('caps a long drive, going faster instead', () => {
    const capped = buildTimeline(MARKS, {length: 100, cruise: 4, maxDrive: 5})
    expect(capped.total).toBe(2 + 1 + 2 + 3 + 5 * 3)
    expect(capped.at(2 + 2.5).speed).toBeCloseTo(((25 * Math.PI) / 10), 6)
  })

  test('copes with two marks at the same spot', () => {
    const t = buildTimeline([{at: 0, dwell: 1}, {at: 0.5, dwell: 1}, {at: 0.5, dwell: 1}, {at: 1, dwell: 1}], {length: 10, cruise: 1})
    for (let s = 0; s < t.total; s += 0.1) expect(Number.isFinite(t.at(s).u)).toBe(true)
  })
})

describe('legAt', () => {
  test('changes vehicle at each stop', () => {
    const stops = [0, 0.5, 1]
    expect(legAt(stops, 0)).toBe(0)
    expect(legAt(stops, 0.49)).toBe(0)
    expect(legAt(stops, 0.5)).toBe(1)
    expect(legAt(stops, 1)).toBe(1)
  })
})

describe('tripMarks', () => {
  test('merges stops and places in road order, a stop first at a shared spot', () => {
    const marks = tripMarks({stopsAt: [0, 0.6, 1], places: [{at: 0.6}, {at: 0.2}]})
    expect(marks.map((m) => `${m.kind[0]}${m.index}`)).toEqual(['s0', 'p1', 's1', 'p0', 's2'])
  })
})

describe('timeOf', () => {
  test('is the moment the loop arrives at a mark', () => {
    expect(timeline.timeOf(0)).toBe(0)
    expect(timeline.at(timeline.timeOf(2))).toMatchObject({u: 0.5, mark: 2, speed: 0})
  })
})

describe('driveBetween', () => {
  test('eases from one place to another, backwards too', () => {
    expect(driveBetween(0.6, 0.2, 4, 0, 100)).toMatchObject({u: 0.6, speed: 0, done: false})
    expect(driveBetween(0.6, 0.2, 4, 2, 100).u).toBeCloseTo(0.4, 9)
    expect(driveBetween(0.6, 0.2, 4, 5, 100)).toEqual({u: 0.2, speed: 0, done: true})
  })
})
