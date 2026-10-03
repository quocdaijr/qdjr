import {CITY_GRID_POINTS, CITY_TRIP_KM, createPlanner} from '~~/scripts/trips/planner.mjs'
import {createThrottle, planKey, type PlanRequest} from './tripRequest'

// One planner for the whole server: every visitor's requests to Valhalla and
// Photon share one queue, a second apart, as those free servers ask. Place
// search has a queue of its own, so typing can never starve planning; both
// refuse new work when too much is already waiting.
const OSM_GAP_MS = 1100
const PLAN_QUEUE_MAX = 40
const SEARCH_GAP_MS = 500
const SEARCH_QUEUE_MAX = 10
const planner = createPlanner({
  throttle: createThrottle(OSM_GAP_MS, PLAN_QUEUE_MAX),
  searchThrottle: createThrottle(SEARCH_GAP_MS, SEARCH_QUEUE_MAX),
  warn: (message: string) => console.warn(`[trips] ${message}`)
})

const CACHE_TTL_MS = 30 * 24 * 3600 * 1000
const SWEEP_EVERY_MS = 24 * 3600 * 1000
// The per-visitor limit trusts X-Forwarded-For, which a client can forge: this caps the queue whatever the IPs.
const MAX_IN_FLIGHT = 4

export class PlannerBusy extends Error {}
const inFlight = new Map<string, Promise<unknown>>()

/** A planned trip in the shape of the curated ones (app/data/trips), for one vehicle. */
async function plan(request: PlanRequest, slug: string) {
  const {stops, vehicle} = request
  const source = {stops: stops.map((s) => ({...s, name: {vi: s.name, en: s.name}}))}
  const variant = await planner.variant(source, vehicle)
  // A city trip: a coarser grid (it covers a few km) and no lake search (Overpass is the slow part,
  // and lakes within 6 km mean little at street scale). Otherwise lakes come from Overpass while the grid waits its turn.
  const city = variant.distanceKm < CITY_TRIP_KM
  const [terrain, lakes] = await Promise.all([
    planner.terrainGrid([variant.route], city ? CITY_GRID_POINTS : undefined),
    city ? Promise.resolve([]) : planner.lakes([variant.route], source.stops)
  ])
  const title = `${stops[0]!.name} → ${stops.at(-1)!.name}`
  return {
    slug,
    title: {vi: title, en: title},
    summary: {vi: '', en: ''},
    vehicle,
    stops: source.stops,
    variants: {[vehicle]: variant},
    terrain,
    lakes
  }
}

type Planned = Awaited<ReturnType<typeof plan>>
export interface PlannedTrip {
  trip: Planned
  cached: boolean
}

/** The cache key ignores names: label the stops and the title with the names asked for this time. */
function named(trip: Planned, request: PlanRequest): Planned {
  const stops = trip.stops.map((s, i) => ({...s, name: {vi: request.stops[i]!.name, en: request.stops[i]!.name}}))
  const title = `${request.stops[0]!.name} → ${request.stops.at(-1)!.name}`
  return {...trip, stops, title: {vi: title, en: title}}
}

let lastSweep = 0
/** Once a day, delete cached plans past their 30 days (the fs driver keeps files for ever). */
async function sweep() {
  if (Date.now() - lastSweep < SWEEP_EVERY_MS) return
  lastSweep = Date.now()
  const storage = useStorage('trips')
  for (const key of await storage.getKeys()) {
    const item = await storage.getItem<{at: number}>(key)
    if (!item || Date.now() - item.at >= CACHE_TTL_MS) await storage.removeItem(key)
  }
}

/** Too many plans running already: refuse before counting the visitor's quota. */
export const isBusy = (request: PlanRequest) => !inFlight.has(planKey(request)) && inFlight.size >= MAX_IN_FLIGHT

/** From the cache, or planned now; the same trip asked twice at once is planned once. */
export async function planTrip(request: PlanRequest): Promise<PlannedTrip> {
  const key = planKey(request)
  const storage = useStorage('trips')
  sweep().catch((error) => console.warn('[trips] sweep failed:', (error as Error).message))
  const hit = await storage.getItem<{at: number; trip: Planned}>(key)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return {trip: named(hit.trip, request), cached: true}
  if (isBusy(request)) throw new PlannerBusy('planner busy')
  const running = inFlight.get(key) ?? plan(request, `plan-${key}`).finally(() => inFlight.delete(key))
  inFlight.set(key, running)
  const trip = (await running) as Planned
  await storage.setItem(key, {at: Date.now(), trip})
  return {trip: named(trip, request), cached: false}
}

export const searchPlaces = (query: string, lang: string) => planner.search(query, lang)

/** Already in the cache: such requests do not count against a visitor's limit. */
export async function isPlanned(request: PlanRequest): Promise<boolean> {
  return useStorage('trips').hasItem(planKey(request))
}
