import {describe, expect, test} from 'vitest'
import {decodePolyline6, distanceKm, gridPoints, joinRings, pickLandmarks, legBoundaries, paddedBbox, pickPlaces, placeHighlights, positionOnRoute, resample, roadFeatures, thinRing} from '~~/scripts/trips/pipeline.mjs'

// A straight road due north along longitude 105, 0.1° of latitude per step (~11.1 km).
const NORTH = Array.from({length: 11}, (_, i) => [105, 21 + i * 0.1] as [number, number])

describe('distanceKm', () => {
  test('measures a tenth of a degree of latitude as about 11.1 km', () => {
    expect(distanceKm([105, 21], [105, 21.1])).toBeCloseTo(11.12, 1)
  })
})

describe('resample', () => {
  test('returns evenly spaced points that keep both ends', () => {
    const out = resample(NORTH, 5)
    expect(out).toHaveLength(5)
    expect(out[0]).toEqual([105, 21])
    expect(out[4][1]).toBeCloseTo(22, 6)
    expect(out[2][1]).toBeCloseTo(21.5, 6)
  })

  test('copes with repeated points', () => {
    expect(resample([[105, 21], [105, 21], [105, 21.2]], 3)[1][1]).toBeCloseTo(21.1, 6)
  })
})

describe('positionOnRoute', () => {
  test('gives the fraction of the route nearest a point beside it', () => {
    const {at, offKm} = positionOnRoute(NORTH, [105.01, 21.25])
    expect(at).toBeCloseTo(0.25, 2)
    expect(offKm).toBeCloseTo(1.04, 1)
  })
})

describe('legBoundaries', () => {
  test('turns leg lengths into fractions of the whole trip', () => {
    expect(legBoundaries([30, 10])).toEqual([0, 0.75, 1])
  })
})

describe('decodePolyline6', () => {
  test('decodes Valhalla shapes into [lng, lat]', () => {
    // Two points, (38.5, −120.2) and (40.7, −120.95), at precision 6.
    expect(decodePolyline6('_izlhA~rlgdF_{geC~ywl@')).toEqual([[-120.2, 38.5], [-120.95, 40.7]])
  })
})

describe('roadFeatures', () => {
  // Ten shape points 1 km apart; edges index into them.
  const along = Array.from({length: 11}, (_, i) => i)
  const edge = (begin: number, end: number, extra: Record<string, unknown> = {}) => ({
    begin_shape_index: begin,
    end_shape_index: end,
    length: end - begin,
    road_class: 'primary',
    density: 2,
    ...extra
  })

  test('turns edges into spans along the whole trip, merging neighbours', () => {
    const {spans} = roadFeatures(
      [edge(0, 2, {road_class: 'motorway'}), edge(2, 4, {road_class: 'motorway'}), edge(4, 5), edge(5, 7, {density: 10}), edge(7, 9, {density: 7})],
      along,
      {offsetKm: 10, totalKm: 20}
    )
    expect(spans).toEqual([
      {kind: 'motorway', from: 0.5, to: 0.7},
      {kind: 'city', from: 0.75, to: 0.95}
    ])
  })

  test('collects named bridges, tunnels and passes, skipping flyovers', () => {
    const {named} = roadFeatures(
      [
        edge(0, 1, {bridge: true, names: ['Cầu Rạch Chiếc']}),
        edge(1, 2, {bridge: true, names: ['Cầu Rạch Chiếc']}),
        edge(2, 3, {bridge: true, names: ['Cầu vượt nút giao QL.51']}),
        edge(3, 4, {tunnel: true, names: ['Hầm Đèo Cả']}),
        edge(5, 8, {names: ['Đèo Bảo Lộc', 'QL.20']})
      ],
      along,
      {offsetKm: 0, totalKm: 10}
    )
    expect(named).toEqual([
      {kind: 'bridge', name: 'Cầu Rạch Chiếc', km: 2, at: 0.1},
      {kind: 'tunnel', name: 'Hầm Đèo Cả', km: 1, at: 0.35},
      {kind: 'pass', name: 'Đèo Bảo Lộc', km: 3, at: 0.65}
    ])
  })
})

describe('pickPlaces', () => {
  const named = [
    {kind: 'bridge', name: 'Cầu nhỏ', km: 0.2, at: 0.3},
    {kind: 'bridge', name: 'Cầu lớn', km: 1.2, at: 0.4},
    {kind: 'pass', name: 'Đèo A', km: 4, at: 0.6},
    {kind: 'tunnel', name: 'Hầm B', km: 0.5, at: 0.605},
    {kind: 'bridge', name: 'Cầu cuối', km: 0.8, at: 0.99}
  ]

  test('keeps the notable ones in road order, away from the stops, one per spot', () => {
    const places = pickPlaces({named, cities: [{name: 'Bảo Lộc', at: 0.5}], sights: [], stopsAt: [0, 1]})
    expect(places.map((p) => p.name.vi)).toEqual(['Cầu lớn', 'Bảo Lộc', 'Đèo A'])
    expect(places[1]).toEqual({kind: 'city', name: {vi: 'Bảo Lộc', en: 'Bảo Lộc'}, at: 0.5})
  })

  test('always keeps hand-picked sights', () => {
    const sights = [{name: {vi: 'Tháp', en: 'Tower'}, at: 0.99}]
    expect(pickPlaces({named: [], cities: [], sights, stopsAt: [0, 1]})).toEqual([{kind: 'sight', name: sights[0].name, at: 0.99}])
  })
})

describe('placeHighlights', () => {
  test('orders hand-picked places along the route and flags far ones', () => {
    const {highlights, far} = placeHighlights(NORTH, [
      {name: {vi: 'B', en: 'B'}, lat: 21.8, lng: 105},
      {name: {vi: 'A', en: 'A'}, lat: 21.2, lng: 105.5}
    ])
    expect(highlights.map((h) => h.name.vi)).toEqual(['A', 'B'])
    expect(highlights[1].at).toBeCloseTo(0.8, 2)
    expect(far).toEqual(['A'])
  })
})

describe('terrain helpers', () => {
  test('paddedBbox pads both axes by the same ground distance', () => {
    const [lngMin, latMin, lngMax, latMax] = paddedBbox([[105, 0], [106, 2]], 0.1)
    expect(latMin).toBeCloseTo(-0.2, 6)
    expect(latMax).toBeCloseTo(2.2, 6)
    expect(lngMin).toBeCloseTo(104.8, 3) // near the equator a degree is nearly a degree
    expect(lngMax).toBeCloseTo(106.2, 3)
  })

  test('gridPoints runs row by row from the south-west corner', () => {
    const grid = gridPoints([0, 0, 2, 1], 3, 2)
    expect(grid).toEqual([[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]])
  })

  test('thinRing keeps at most max points', () => {
    const ring = Array.from({length: 100}, (_, i) => [i, i] as [number, number])
    expect(thinRing(ring, 30).length).toBeLessThanOrEqual(30)
  })
})

describe('joinRings', () => {
  test('joins a shore split across ways, reversing where needed, and drops what never closes', () => {
    const rings = joinRings([
      [[0, 0], [1, 0], [1, 1]],
      [[0, 0], [0, 1], [1, 1]], // runs the other way round
      [[5, 5], [6, 5]] // an open scrap
    ])
    expect(rings).toEqual([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]])
  })
})

describe('pickLandmarks', () => {
  const place = (name: string, lat: number, tags: Record<string, string> = {}) => ({lat, lon: 105, tags: {name, tourism: 'museum', ...tags}})

  test('keeps one landmark per stretch, preferring those with a wikidata entry, never by a stop', () => {
    const picked = pickLandmarks(
      NORTH,
      [place('Plain', 21.31), place('Famous', 21.33, {wikidata: 'Q1'}), place('Far', 21.82), place('At the start', 21.005)],
      {count: 2, stops: [0, 1]}
    )
    expect(picked.map((p) => p.name.vi)).toEqual(['Famous', 'Far'])
  })

  test('reads way centres and name:en, and skips places off the street', () => {
    const picked = pickLandmarks(
      NORTH,
      [{center: {lat: 21.5, lon: 105}, tags: {name: 'Chợ', 'name:en': 'Market', amenity: 'marketplace'}}, place('Away', 21.85, {}), {lat: 21.6, lon: 105.5, tags: {name: 'Off'}}],
      {count: 4, stops: [0, 1]}
    )
    expect(picked.map((p) => p.name)).toEqual([{vi: 'Chợ', en: 'Market'}, {vi: 'Away', en: 'Away'}])
  })
})
