// Pure helpers behind scripts/build-trip.mjs: no network, no files.
// Roads come from Valhalla (route, trace_attributes, height).
// Coordinates are GeoJSON order, [lng, lat] in degrees.

const EARTH_KM = 6371
const RAD = Math.PI / 180

/** Great-circle distance between two [lng, lat] points. */
export function distanceKm([lng1, lat1], [lng2, lat2]) {
  const dLat = (lat2 - lat1) * RAD
  const dLng = (lng2 - lng1) * RAD
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_KM * Math.asin(Math.sqrt(h))
}

function cumulative(points) {
  const out = [0]
  for (let i = 1; i < points.length; i++) out.push(out[i - 1] + distanceKm(points[i - 1], points[i]))
  return out
}

/** Length of a polyline, km. */
export const pathKm = (points) => cumulative(points).at(-1)

/** `count` points evenly spaced by distance along the polyline, both ends kept. */
export function resample(points, count) {
  const along = cumulative(points)
  const total = along.at(-1)
  const out = []
  let seg = 1
  for (let k = 0; k < count; k++) {
    const want = (total * k) / (count - 1)
    while (seg < points.length - 1 && along[seg] < want) seg++
    const span = along[seg] - along[seg - 1]
    const t = span > 0 ? Math.min(1, Math.max(0, (want - along[seg - 1]) / span)) : 0
    const [a, b] = [points[seg - 1], points[seg]]
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
  }
  return out
}

/** Where along the route (0..1 of its length) a point lies, and how far off it, in km. */
export function positionOnRoute(route, point) {
  const along = cumulative(route)
  const kx = Math.cos(point[1] * RAD) // local flat projection: fine at a few km
  let best = {at: 0, offKm: Infinity}
  for (let i = 1; i < route.length; i++) {
    const [a, b] = [route[i - 1], route[i]]
    const dx = (b[0] - a[0]) * kx
    const dy = b[1] - a[1]
    const len2 = dx * dx + dy * dy
    const t = len2 > 0 ? Math.min(1, Math.max(0, (((point[0] - a[0]) * kx) * dx + (point[1] - a[1]) * dy) / len2)) : 0
    const foot = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
    const offKm = distanceKm(foot, point)
    if (offKm < best.offKm) best = {at: (along[i - 1] + (along[i] - along[i - 1]) * t) / along.at(-1), offKm}
  }
  return best
}

/** Leg lengths → the fraction of the trip at each stop, first 0 and last 1. */
export function legBoundaries(legKm) {
  const total = legKm.reduce((a, b) => a + b, 0)
  let run = 0
  return [0, ...legKm.map((km) => (run += km) / total)].map((x) => Math.round(x * 1e4) / 1e4)
}

/** Hand-picked sights, placed along the route in order; `far` lists those more than `maxOffKm` off it. */
export function placeHighlights(route, curated, maxOffKm = 10) {
  const placed = curated.map((h) => ({...h, ...positionOnRoute(route, [h.lng, h.lat])}))
  return {
    highlights: placed.sort((a, b) => a.at - b.at).map(({name, lat, lng, at}) => ({name, lat, lng, at: Math.round(at * 1e4) / 1e4})),
    far: placed.filter((h) => h.offKm > maxOffKm).map((h) => h.name.en)
  }
}

/** Valhalla's encoded polyline (precision 6) → [lng, lat] points. */
export function decodePolyline6(encoded) {
  const points = []
  let index = 0
  let lat = 0
  let lng = 0
  const next = () => {
    let result = 0
    let shift = 0
    let byte
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)
    return result & 1 ? ~(result >> 1) : result >> 1
  }
  while (index < encoded.length) {
    lat += next()
    lng += next()
    points.push([lng / 1e6, lat / 1e6])
  }
  return points
}

/** Cumulative km at each point of a polyline. */
export function alongKm(points) {
  return cumulative(points)
}

const SPAN_RULES = {
  motorway: {test: (e) => e.road_class === 'motorway', minKm: 1},
  bridge: {test: (e) => e.bridge, minKm: 0.1},
  tunnel: {test: (e) => e.tunnel, minKm: 0},
  city: {test: (e) => e.density >= 6, minKm: 1}
}
const MERGE_GAP_KM = 0.6
const FLYOVER = /vượt|nút giao|overpass/i
const NAMED = [
  {kind: 'pass', test: (e, name) => /^Đèo\s/.test(name)},
  {kind: 'tunnel', test: (e, name) => e.tunnel && /^Hầm\s/i.test(name)},
  {kind: 'bridge', test: (e, name) => e.bridge && /^Cầu\s/.test(name) && !FLYOVER.test(name)}
]
const round4 = (x) => Math.round(x * 1e4) / 1e4

/**
 * Valhalla trace_attributes edges of one leg → spans (motorway, bridge,
 * tunnel, city) and named features, as fractions of the whole trip.
 * `along` is the cumulative km of the leg's shape; the leg starts `offsetKm` in.
 */
export function roadFeatures(edges, along, {offsetKm, totalKm}) {
  const kmOf = (i) => offsetKm + along[Math.min(i, along.length - 1)]
  const spans = []
  for (const [kind, rule] of Object.entries(SPAN_RULES)) {
    const runs = []
    for (const e of edges) {
      if (!rule.test(e)) continue
      const [from, to] = [kmOf(e.begin_shape_index), kmOf(e.end_shape_index)]
      const last = runs.at(-1)
      if (last && from - last.to < MERGE_GAP_KM) last.to = to
      else runs.push({from, to})
    }
    for (const r of runs) if (r.to - r.from >= rule.minKm) spans.push({kind, from: round4(r.from / totalKm), to: round4(r.to / totalKm)})
  }
  const groups = new Map()
  for (const e of edges) {
    for (const name of e.names ?? []) {
      const rule = NAMED.find((n) => n.test(e, name))
      if (!rule) continue
      const key = `${rule.kind}:${name}`
      const g = groups.get(key) ?? {kind: rule.kind, name, km: 0, from: kmOf(e.begin_shape_index), to: 0}
      g.km += e.length
      g.to = kmOf(e.end_shape_index)
      groups.set(key, g)
    }
  }
  const named = [...groups.values()].map(({kind, name, km, from, to}) => ({kind, name, km: round4(km), at: round4((from + to) / 2 / totalKm)}))
  return {spans: spans.sort((a, b) => a.from - b.from), named: named.sort((a, b) => a.at - b.at)}
}

const PRIORITY = ['sight', 'pass', 'tunnel', 'city', 'bridge']
const LIMITS = {bridgeKm: 0.3, tunnelKm: 0.3, bridges: 4, total: 12, nearStop: 0.02, apart: 0.012}

/** The places worth naming along the way, in road order. */
export function pickPlaces({named, cities, sights, stopsAt}) {
  const candidates = [
    ...sights.map((s) => ({kind: 'sight', name: s.name, at: s.at})),
    ...named.filter((n) => n.kind === 'pass').map((n) => ({kind: 'pass', name: n.name, at: n.at})),
    ...named.filter((n) => n.kind === 'tunnel' && n.km >= LIMITS.tunnelKm).map((n) => ({kind: 'tunnel', name: n.name, at: n.at})),
    ...cities.map((c) => ({kind: 'city', name: c.name, at: c.at})),
    ...named
      .filter((n) => n.kind === 'bridge' && n.km >= LIMITS.bridgeKm)
      .sort((a, b) => b.km - a.km)
      .slice(0, LIMITS.bridges)
      .map((n) => ({kind: 'bridge', name: n.name, at: n.at}))
  ].sort((a, b) => PRIORITY.indexOf(a.kind) - PRIORITY.indexOf(b.kind))
  const kept = []
  for (const c of candidates) {
    if (c.kind !== 'sight' && stopsAt.some((s) => Math.abs(s - c.at) < LIMITS.nearStop)) continue
    if (kept.some((k) => Math.abs(k.at - c.at) < LIMITS.apart)) continue
    if (kept.length < LIMITS.total || c.kind === 'sight') kept.push(c)
  }
  return kept
    .map((c) => ({kind: c.kind, name: typeof c.name === 'string' ? {vi: c.name, en: c.name} : c.name, at: c.at}))
    .sort((a, b) => a.at - b.at)
}

/** The route's bounding box, [lngMin, latMin, lngMax, latMax], padded by `pad` of its longer side (in ground distance). */
export function paddedBbox(route, pad) {
  const lngs = route.map((p) => p[0])
  const lats = route.map((p) => p[1])
  const kx = Math.cos(((Math.min(...lats) + Math.max(...lats)) / 2) * RAD)
  const span = Math.max((Math.max(...lngs) - Math.min(...lngs)) * kx, Math.max(...lats) - Math.min(...lats))
  const dLat = span * pad
  const dLng = dLat / kx
  return [Math.min(...lngs) - dLng, Math.min(...lats) - dLat, Math.max(...lngs) + dLng, Math.max(...lats) + dLat].map((x) => Math.round(x * 1e5) / 1e5)
}

/** A cols × rows grid over the box, row by row from the south-west corner, as [lng, lat]. */
export function gridPoints([lngMin, latMin, lngMax, latMax], cols, rows) {
  const out = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) out.push([lngMin + ((lngMax - lngMin) * c) / (cols - 1), latMin + ((latMax - latMin) * r) / (rows - 1)])
  }
  return out
}

/** Every k-th point of a closed ring so at most `max` remain (lakes only need their outline at board scale). */
export function thinRing(ring, max) {
  const step = Math.max(1, Math.ceil(ring.length / max))
  return ring.filter((_, i) => i % step === 0).map(([lng, lat]) => [Math.round(lng * 1e5) / 1e5, Math.round(lat * 1e5) / 1e5])
}

/**
 * OSM multipolygon outer ways → closed rings: big lakes split their shore
 * across several ways, joined end to end (reversed where needed).
 */
export function joinRings(ways) {
  const same = (a, b) => a[0] === b[0] && a[1] === b[1]
  const pool = ways.filter((w) => w.length > 1).map((w) => [...w])
  const rings = []
  while (pool.length) {
    const ring = pool.shift()
    while (!same(ring[0], ring.at(-1))) {
      const i = pool.findIndex((w) => same(w[0], ring.at(-1)) || same(w.at(-1), ring.at(-1)))
      if (i < 0) break
      const next = pool.splice(i, 1)[0]
      ring.push(...(same(next[0], ring.at(-1)) ? next : next.reverse()).slice(1))
    }
    if (same(ring[0], ring.at(-1))) rings.push(ring)
  }
  return rings
}

const LANDMARK_OFF_KM = 0.4
const LANDMARK_NEAR_STOP = 0.02

/**
 * Overpass landmarks along a city trip: at most one per equal stretch
 * (`count` stretches), those with a wikidata entry first, none right at a stop.
 */
export function pickLandmarks(route, elements, {count, stops}) {
  const best = new Map()
  for (const el of elements) {
    const name = el.tags?.name
    const lat = el.lat ?? el.center?.lat
    const lng = el.lon ?? el.center?.lon
    if (!name || lat === undefined) continue
    const {at, offKm} = positionOnRoute(route, [lng, lat])
    if (offKm > LANDMARK_OFF_KM || stops.some((s) => Math.abs(s - at) < LANDMARK_NEAR_STOP)) continue
    const score = el.tags.wikidata ? 1 : 0
    const bin = Math.min(count - 1, Math.floor(at * count))
    const held = best.get(bin)
    if (!held || score > held.score || (score === held.score && offKm < held.offKm)) best.set(bin, {name: {vi: name, en: el.tags['name:en'] ?? name}, at: round4(at), score, offKm})
  }
  return [...best.values()].sort((a, b) => a.at - b.at).map(({name, at}) => ({name, at}))
}
