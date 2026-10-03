import {describe, expect, test} from 'vitest'
import {spanAt, visualSpans} from '~/scenes/trip/spans'

const variant = (spans: object[], places: object[]) => ({spans, places}) as never

describe('visualSpans', () => {
  test('stretches a named bridge to a visible length around its spot', () => {
    const out = visualSpans(variant([], [{kind: 'bridge', name: {vi: 'Cầu', en: 'Cầu'}, at: 0.5}]), 100)
    expect(out).toEqual([{kind: 'bridge', from: 0.491, to: 0.509, river: true}])
  })

  test('draws unnamed bridges (flyovers, mostly) only when long enough to see, without a river', () => {
    const out = visualSpans(variant([{kind: 'bridge', from: 0.1, to: 0.101}, {kind: 'bridge', from: 0.3, to: 0.33}], []), 100)
    expect(out).toEqual([{kind: 'bridge', from: 0.3, to: 0.33}])
  })

  test('keeps expressways as they are and widens short towns, merging overlaps', () => {
    const out = visualSpans(variant([{kind: 'motorway', from: 0.2, to: 0.6}, {kind: 'city', from: 0.7, to: 0.705}, {kind: 'city', from: 0.71, to: 0.72}], []), 100)
    expect(out).toEqual([
      {kind: 'motorway', from: 0.2, to: 0.6},
      {kind: 'city', from: 0.6825, to: 0.735}
    ])
  })

  test('clamps to the road', () => {
    const out = visualSpans(variant([], [{kind: 'tunnel', name: {vi: 'H', en: 'H'}, at: 0.995}]), 100)
    expect(out[0].to).toBe(1)
  })
})

describe('spanAt', () => {
  test('finds the span of a kind covering u', () => {
    const spans = [{kind: 'bridge' as const, from: 0.2, to: 0.3}]
    expect(spanAt(spans, 'bridge', 0.25)).toBe(spans[0])
    expect(spanAt(spans, 'bridge', 0.35)).toBeUndefined()
    expect(spanAt(spans, 'tunnel', 0.25)).toBeUndefined()
  })
})
