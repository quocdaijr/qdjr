import {isVehicle, type Vehicle} from '~/data/trips'

// A planned trip lives in its URL (/trips/plan?stop=lat,lng,name&stop=…&v=car),
// so it can be shared, reloaded and edited back on /trips.

export interface PlanStop {
  name: string
  lat: number
  lng: number
}

const DEFAULT_VEHICLE: Vehicle = 'motorbike'

export function writePlanQuery(stops: readonly PlanStop[], vehicle: Vehicle): {stop: string[]; v: Vehicle} {
  return {stop: stops.map((s) => `${s.lat},${s.lng},${s.name}`), v: vehicle}
}

export function readPlanQuery(query: Record<string, unknown>): {stops: PlanStop[]; vehicle: Vehicle} {
  const raw = query.stop === undefined ? [] : Array.isArray(query.stop) ? query.stop : [query.stop]
  const stops = raw.flatMap((value) => {
    if (typeof value !== 'string') return []
    const [lat, lng, ...name] = value.split(',')
    const stop = {name: name.join(',').trim(), lat: Number(lat), lng: Number(lng)}
    return stop.name && Number.isFinite(stop.lat) && Number.isFinite(stop.lng) ? [stop] : []
  })
  return {stops, vehicle: isVehicle(query.v) ? query.v : DEFAULT_VEHICLE}
}
