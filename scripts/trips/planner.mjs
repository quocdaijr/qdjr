// The trip pipeline, shared by scripts/build-trip.mjs (the curated trips,
// built once) and the /api/trips/plan route (a visitor's own trip): routes a
// trip for one vehicle with Valhalla, reads its bridges, tunnels,
// expressways and towns, the elevation along it and over the whole board,
// names towns with Photon and finds lakes and, on short city trips,
// landmarks with Overpass.
//
// Network calls to Valhalla and Photon go through `throttle(task)`, which the
// caller supplies: both are free community servers, so requests must go one
// at a time with a pause (the script waits; the server queues every visitor
// behind one another).
import {alongKm, decodePolyline6, gridPoints, joinRings, legBoundaries, paddedBbox, pathKm, pickLandmarks, pickPlaces, placeHighlights, resample, roadFeatures, thinRing} from './pipeline.mjs'

export const USER_AGENT = 'qdjr.me-trips/1.0 (+https://qdjr.me)'
const HEADERS = {'User-Agent': USER_AGENT, 'Content-Type': 'application/json'}
const VALHALLA = 'https://valhalla1.openstreetmap.de'
const PHOTON = 'https://photon.komoot.io'
// Overpass mirrors, the steadiest first (the main instance is often overloaded).
const OVERPASS = [
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter'
]
// Valhalla costing per vehicle. Motorbikes may not use Vietnamese expressways.
export const COSTING = {motorbike: 'motorcycle', car: 'auto', coach: 'bus'}
const COSTING_OPTIONS = {motorcycle: {use_highways: 0}}
const SPLIT_KM = 150 // trace_attributes map-matches at most 200 km per request
const ROUTE_POINTS = 300
const SIGHT_MAX_OFF_KM = 8
// A trip shorter than this is a city trip: its places are landmarks along the street, not towns.
export const CITY_TRIP_KM = 40
export {CITY_GRID_POINTS}
const LANDMARK = {aroundM: 250, queryPoints: 60, count: 8}
// Terrain: one elevation grid, over every road given, a little wider than the board.
const GRID_POINTS = 6900
const CITY_GRID_POINTS = 2500 // a few km across: still finer than the 30 m elevation data, and three times quicker to fetch
const GRID_PAD = 0.16 // the board shows 7 units of margin on a 60-unit route: ~12 %, plus slack
const RIVER_WATER = /^(river|canal|stream|ditch|drain|stream_pool)$/
const RIVER_NAME = /^(Sông|Kênh|Rạch)\s/i // relations often carry only the name
const LAKE = {nearStopDeg: 0.01, minStopSpanDeg: 0.004, aroundM: 6000, queryPoints: 40, minSpanDeg: 0.012, ringPoints: 40, max: 8}
const OVERPASS_TIMEOUT_MS = 15000
// A stalled connection must not hold the shared queue for ever.
const REQUEST_TIMEOUT_MS = 30000
const DECIMALS = 5
const HAMLET = /^(Thôn|TDP|Ấp|Khu phố|Tổ|Buôn|Làng)\s/i
const ADMIN_PREFIX = /^(Xã|Phường|Thị trấn)\s+/i

const round = (x) => Math.round(x * 10 ** DECIMALS) / 10 ** DECIMALS
const coords = (route) => route.map(([lng, lat]) => `${+lat.toFixed(4)},${+lng.toFixed(4)}`).join(',')

/**
 * @param {{throttle: <T>(task: () => Promise<T>) => Promise<T>, searchThrottle?: <T>(task: () => Promise<T>) => Promise<T>, warn?: (message: string) => void}} options
 * `searchThrottle` keeps place search off the planning queue (defaults to the same).
 */
export function createPlanner({throttle, searchThrottle = throttle, warn = () => {}}) {
  const valhalla = (endpoint, body) =>
    throttle(async () => {
      const res = await fetch(`${VALHALLA}/${endpoint}`, {method: 'POST', headers: HEADERS, body: JSON.stringify(body), signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)})
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.error) throw new Error(`Valhalla ${endpoint} ${res.status}: ${data.error ?? 'no body'}`)
      return data
    })

  /** The first Overpass mirror that answers; null when all fail. */
  async function overpass(query) {
    for (const endpoint of OVERPASS) {
      try {
        const res = await fetch(endpoint, {method: 'POST', body: new URLSearchParams({data: query}), headers: {'User-Agent': USER_AGENT}, signal: AbortSignal.timeout(OVERPASS_TIMEOUT_MS)})
        return (await res.json()).elements
      } catch (error) {
        warn(`${endpoint}: ${error.message.slice(0, 80)}`)
      }
    }
    return null
  }

  /** Edges of one leg, traced in stretches of at most SPLIT_KM; shape indexes are made relative to the whole leg. */
  async function traceLeg(points, costing) {
    const along = alongKm(points)
    const edges = []
    for (let start = 0; start < points.length - 1; ) {
      let end = start + 1
      while (end < points.length - 1 && along[end + 1] - along[start] <= SPLIT_KM) end++
      const data = await valhalla('trace_attributes', {
        shape: points.slice(start, end + 1).map(([lon, lat]) => ({lat, lon})),
        costing,
        shape_match: 'walk_or_snap',
        filters: {
          attributes: ['edge.names', 'edge.bridge', 'edge.tunnel', 'edge.road_class', 'edge.length', 'edge.density', 'edge.begin_shape_index', 'edge.end_shape_index'],
          action: 'include'
        }
      })
      for (const e of data.edges) edges.push({...e, begin_shape_index: e.begin_shape_index + start, end_shape_index: e.end_shape_index + start})
      start = end
    }
    return edges
  }

  const townName = ([lng, lat]) =>
    throttle(async () => {
      const res = await fetch(`${PHOTON}/reverse?lat=${lat}&lon=${lng}`, {headers: HEADERS, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)})
      const props = (await res.json().catch(() => ({}))).features?.[0]?.properties ?? {}
      const name = props.city ?? props.town ?? props.district ?? props.county
      // Hamlet-level answers ("Thôn 4", "TDP Cẩm Văn") name nothing a reader knows.
      if (!name || HAMLET.test(name)) return null
      return name.replace(ADMIN_PREFIX, '')
    })

  async function routeLeg(from, to, costing) {
    const {trip} = await valhalla('route', {
      locations: [from, to].map(([lon, lat]) => ({lat, lon})),
      costing,
      costing_options: COSTING_OPTIONS[costing] && {[costing]: COSTING_OPTIONS[costing]}
    })
    return {points: decodePolyline6(trip.legs[0].shape), km: trip.summary.length, minutes: trip.summary.time / 60}
  }

  /** Named landmarks right beside a city trip's streets (markets, churches, museums, parks…). */
  async function landmarks(full, stopsAt) {
    const around = `around:${LANDMARK.aroundM},${coords(resample(full, LANDMARK.queryPoints))}`
    const elements = await overpass(
      [
        '[out:json][timeout:25];(',
        `nwr(${around})["tourism"~"^(attraction|museum|gallery|viewpoint|zoo|theme_park)$"]["name"];`,
        `nwr(${around})["historic"]["name"];`,
        `nwr(${around})["amenity"~"^(place_of_worship|marketplace|theatre)$"]["name"];`,
        `nwr(${around})["leisure"="park"]["name"];`,
        ');out center tags;'
      ].join('')
    )
    if (!elements) warn('no landmarks: every Overpass mirror failed')
    return pickLandmarks(full, elements ?? [], {count: LANDMARK.count, stops: stopsAt})
  }

  /** The trip as one vehicle drives it. */
  async function variant(source, vehicle) {
    const costing = COSTING[vehicle]
    const ends = source.stops.map((s) => [s.lng, s.lat])
    const routedLegs = []
    for (let i = 0; i < ends.length - 1; i++) routedLegs.push(await routeLeg(ends[i], ends[i + 1], costing))
    const legs = routedLegs.map((l) => l.points)
    const legKm = legs.map(pathKm)
    const totalKm = legKm.reduce((a, b) => a + b, 0)
    const spans = []
    const named = []
    let offsetKm = 0
    for (let i = 0; i < legs.length; i++) {
      const features = roadFeatures(await traceLeg(legs[i], costing), alongKm(legs[i]), {offsetKm, totalKm})
      spans.push(...features.spans)
      named.push(...features.named)
      offsetKm += legKm[i]
    }
    // Each leg starts where the previous ended: drop the duplicated joint.
    const full = legs.flatMap((points, i) => (i === 0 ? points : points.slice(1)))
    const route = resample(full, ROUTE_POINTS).map(([lng, lat]) => [round(lng), round(lat)])
    const stopsAt = legBoundaries(legKm)
    const cityTrip = totalKm < CITY_TRIP_KM
    // Overpass is slow and not throttled: ask it now, while Valhalla and Photon work through the queue.
    const nearby = cityTrip ? landmarks(full, stopsAt) : Promise.resolve([])
    const {height} = await valhalla('height', {shape: route.map(([lon, lat]) => ({lat, lon})), range: false})
    // A city trip is all town: its places are the landmarks it passes. Otherwise name the towns,
    // except one reaching a stop — that is the stop's own city, drawn but not named twice.
    const cities = []
    if (!cityTrip) {
      const touchesStop = (span) => stopsAt.some((at) => span.from <= at + 0.01 && span.to >= at - 0.01)
      for (const span of spans.filter((s) => s.kind === 'city' && !touchesStop(s))) {
        const at = Math.round(((span.from + span.to) / 2) * 1e4) / 1e4
        const name = await townName(route[Math.round(at * (route.length - 1))])
        if (name && !cities.some((c) => c.name === name)) cities.push({name, at})
      }
    }
    // Hand-picked sights too far off this vehicle's road are left out.
    const {highlights, far} = placeHighlights(full, source.sights ?? [], SIGHT_MAX_OFF_KM)
    const sights = [...highlights.filter((h) => !far.includes(h.name.en)), ...(await nearby)]
    return {
      distanceKm: Math.round(routedLegs.reduce((a, l) => a + l.km, 0) * 10) / 10,
      durationMin: Math.round(routedLegs.reduce((a, l) => a + l.minutes, 0)),
      stopsAt,
      spans,
      places: pickPlaces({named, cities, sights, stopsAt}),
      route,
      elevation: height.map((h) => (h === null ? 0 : Math.round(h)))
    }
  }

  /** Metres above sea level over a grid covering the roads; the sea comes back below 0. */
  async function terrainGrid(routes, points = GRID_POINTS) {
    const bbox = paddedBbox(routes.flat(), GRID_PAD)
    const kx = Math.cos((((bbox[1] + bbox[3]) / 2) * Math.PI) / 180)
    const aspect = ((bbox[2] - bbox[0]) * kx) / (bbox[3] - bbox[1])
    const cols = Math.max(2, Math.round(Math.sqrt(points * aspect)))
    const rows = Math.max(2, Math.round(points / cols))
    const {height} = await valhalla('height', {shape: gridPoints(bbox, cols, rows).map(([lon, lat]) => ({lat, lon})), range: false})
    return {bbox, cols, rows, heights: height.map((h) => (h === null ? 0 : Math.round(h)))}
  }

  /** Named lakes and reservoirs near the roads, as thinned outlines; none if every Overpass mirror fails. */
  async function lakes(routes, stops) {
    const around = coords(routes.flatMap((r) => resample(r, LAKE.queryPoints)))
    const elements = await overpass(`[out:json][timeout:90];(way(around:${LAKE.aroundM},${around})["natural"="water"]["name"];relation(around:${LAKE.aroundM},${around})["natural"="water"]["name"];);out geom;`)
    if (!elements) {
      warn('no lakes: every Overpass mirror failed')
      return []
    }
    // A lake mapped as a multipolygon: its outer ways joined into rings, the largest is the outline.
    const outline = (e) => {
      if (e.geometry) return e.geometry
      const ways = (e.members ?? []).filter((m) => m.role === 'outer' && m.geometry).map((m) => m.geometry.map((p) => [p.lon, p.lat]))
      return joinRings(ways).sort((a, b) => b.length - a.length)[0]?.map(([lon, lat]) => ({lon, lat}))
    }
    const shaped = elements.map((e) => ({...e, geometry: outline(e)}))
    const span = (g) => Math.max(Math.max(...g.map((p) => p.lon)) - Math.min(...g.map((p) => p.lon)), Math.max(...g.map((p) => p.lat)) - Math.min(...g.map((p) => p.lat)))
    // A lake by a stop (Da Lat's Xuan Huong) is kept whatever its size; then the biggest.
    const byStop = (g) => span(g) >= LAKE.minStopSpanDeg && stops.some((s) => g.some((p) => Math.hypot(p.lon - s.lng, p.lat - s.lat) < LAKE.nearStopDeg))
    const rank = (e) => (byStop(e.geometry) ? Infinity : span(e.geometry))
    return shaped
      // Rivers mapped as areas are long ribbons: thinned to a few points they turn to zigzags.
      .filter((e) => e.geometry?.length > 3 && !RIVER_WATER.test(e.tags.water ?? '') && !RIVER_NAME.test(e.tags.name) && (span(e.geometry) >= LAKE.minSpanDeg || byStop(e.geometry)))
      .sort((a, b) => rank(b) - rank(a))
      .slice(0, LAKE.max)
      .map((e) => ({name: e.tags.name, ring: thinRing(e.geometry.map((p) => [p.lon, p.lat]), LAKE.ringPoints)}))
  }

  /** Place suggestions for a search box, biased to Vietnam. */
  const search = (query, lang = 'default') =>
    searchThrottle(async () => {
      const res = await fetch(`${PHOTON}/api/?q=${encodeURIComponent(query)}&limit=6&lang=${lang}&bbox=102,8,110,24`, {headers: HEADERS, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)})
      const {features = []} = await res.json().catch(() => ({}))
      return features.map((f) => {
        const p = f.properties ?? {}
        const where = [p.street, p.district, p.city ?? p.county, p.state].filter((x) => x && x !== p.name)
        return {name: p.name ?? where[0] ?? query, detail: [...new Set(where)].join(', '), lng: round(f.geometry.coordinates[0]), lat: round(f.geometry.coordinates[1])}
      })
    })

  return {variant, terrainGrid, lakes, search}
}
