import {createHash} from 'node:crypto'

// Pure pieces of the trip planner API: request validation, cache keys, a
// per-visitor rate limit and the queue that keeps the free OSM services at
// one request at a time.

export type PlanVehicle = 'motorbike' | 'car' | 'coach'
export interface PlanStop {
  name: string
  lat: number
  lng: number
}
export interface PlanRequest {
  stops: PlanStop[]
  vehicle: PlanVehicle
}

const VEHICLES: readonly PlanVehicle[] = ['motorbike', 'car', 'coach']
const STOPS = {min: 2, max: 6}
const NAME_MAX = 80
// Vietnam, with a little sea: the routing data and the board are tuned for it.
const BOUNDS = {latMin: 8, latMax: 24, lngMin: 102, lngMax: 110}
const MIN_APART_DEG = 0.0005 // ~50 m: two stops this close are the same place
const DECIMALS = 5

const round = (x: number) => Math.round(x * 10 ** DECIMALS) / 10 ** DECIMALS

export function parsePlanRequest(body: unknown): {ok: true; value: PlanRequest} | {ok: false; error: string} {
  const input = (body ?? {}) as {stops?: unknown; vehicle?: unknown}
  if (!Array.isArray(input.stops) || input.stops.length < STOPS.min || input.stops.length > STOPS.max) {
    return {ok: false, error: `stops: give ${STOPS.min} to ${STOPS.max}`}
  }
  if (!VEHICLES.includes(input.vehicle as PlanVehicle)) return {ok: false, error: `vehicle: one of ${VEHICLES.join(', ')}`}
  const stops: PlanStop[] = []
  for (const raw of input.stops as Array<Record<string, unknown>>) {
    const name = typeof raw?.name === 'string' ? raw.name.trim() : ''
    if (!name || name.length > NAME_MAX) return {ok: false, error: `name: 1 to ${NAME_MAX} characters`}
    const {lat, lng} = raw
    if (typeof lat !== 'number' || typeof lng !== 'number' || !(lat >= BOUNDS.latMin && lat <= BOUNDS.latMax && lng >= BOUNDS.lngMin && lng <= BOUNDS.lngMax)) {
      return {ok: false, error: `${name}: outside Vietnam`}
    }
    const stop = {name, lat: round(lat), lng: round(lng)}
    const prev = stops.at(-1)
    if (prev && Math.hypot(prev.lat - stop.lat, prev.lng - stop.lng) < MIN_APART_DEG) return {ok: false, error: `${name}: the same place as the stop before`}
    stops.push(stop)
  }
  return {ok: true, value: {stops, vehicle: input.vehicle as PlanVehicle}}
}

/**
 * A short stable id for a planned trip: the cache key and the slug. Names are
 * left out — they only label the stops — so renaming a stop cannot force a
 * fresh plan (tripPlanner.ts puts the asked names back on the cached trip).
 */
export function planKey({stops, vehicle}: PlanRequest): string {
  return createHash('sha256').update(JSON.stringify([vehicle, stops.map((s) => [s.lat, s.lng])])).digest('hex').slice(0, 16)
}

/**
 * The visitor's address behind our reverse proxy: the right end of
 * X-Forwarded-For is what the proxy added; the left end is whatever the client
 * sent. Without the header, the socket's address.
 */
export function clientIp(forwardedFor: string | undefined, socketAddress: string | undefined): string {
  return forwardedFor?.split(',').at(-1)?.trim() || socketAddress || 'unknown'
}

/** Sliding-window limiter: `limit` calls per `windowMs` per key (a visitor's IP). Visitors whose window has passed are forgotten. */
export function createRateLimiter({limit, windowMs, now = Date.now}: {limit: number; windowMs: number; now?: () => number}) {
  const hits = new Map<string, number[]>()
  let swept = now()
  const allow = (key: string): boolean => {
    const t = now()
    if (t - swept > windowMs) {
      for (const [k, list] of hits) if (t - list.at(-1)! >= windowMs) hits.delete(k)
      swept = t
    }
    const recent = (hits.get(key) ?? []).filter((at) => t - at < windowMs)
    if (recent.length >= limit) {
      hits.set(key, recent)
      return false
    }
    hits.set(key, [...recent, t])
    return true
  }
  return Object.assign(allow, {size: () => hits.size})
}

export class QueueFull extends Error {}

/** Runs tasks one at a time with `gapMs` between starts; a failed task does not stall the queue; past `maxWaiting` it refuses (QueueFull). */
export function createThrottle(gapMs: number, maxWaiting = Infinity) {
  let tail: Promise<unknown> = Promise.resolve()
  let last = -Infinity
  let waiting = 0
  return <T>(task: () => Promise<T>): Promise<T> => {
    if (waiting >= maxWaiting) return Promise.reject(new QueueFull('queue full'))
    waiting++
    const run = tail.then(async () => {
      waiting--
      const wait = last + gapMs - Date.now()
      if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
      last = Date.now()
      return task()
    })
    tail = run.catch(() => undefined)
    return run
  }
}
