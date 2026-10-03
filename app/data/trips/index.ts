// Trips shown on /trips, generated from trips/sources/ by scripts/build-trip.mjs
// (OpenStreetMap data via Valhalla: one road per vehicle, with its bridges,
// tunnels, expressways, towns and elevation). Place names come in both languages.
import sgAnluong from './sg-anluong.json'
import sgDalat from './sg-dalat.json'
import sgPhanthiet from './sg-phanthiet.json'

export type Vehicle = 'motorbike' | 'car' | 'coach'
export const VEHICLES: readonly Vehicle[] = ['motorbike', 'car', 'coach']

export interface LocalName {
  vi: string
  en: string
}

export interface TripStop {
  name: LocalName
  lat: number
  lng: number
}

/** A stretch of road, as fractions 0..1 of its length. */
export interface RoadSpan {
  kind: 'motorway' | 'bridge' | 'tunnel' | 'city'
  from: number
  to: number
}

export interface TripPlace {
  kind: 'city' | 'pass' | 'bridge' | 'tunnel' | 'sight'
  name: LocalName
  /** Position along the road, 0 (start) .. 1 (end) of its length. */
  at: number
}

/** The trip as one vehicle drives it: a motorbike stays off expressways, so its road can differ. */
export interface TripVariant {
  distanceKm: number
  durationMin: number
  /** Where each stop lies along the road. */
  stopsAt: number[]
  spans: RoadSpan[]
  places: TripPlace[]
  /** The road, evenly resampled, as [lng, lat]. */
  route: [number, number][]
  /** Metres above sea level at each route point. */
  elevation: number[]
}

/** Elevation over the whole board: metres on a cols × rows grid, row by row from the south-west; the sea is below 0. */
export interface TripTerrain {
  bbox: [number, number, number, number]
  cols: number
  rows: number
  heights: number[]
}

/** A named lake or reservoir near the road, as an outline of [lng, lat]. */
export interface TripLake {
  name: string
  ring: [number, number][]
}

export interface Trip {
  slug: string
  title: LocalName
  summary: LocalName
  /** The vehicle the trip is shown with first. */
  vehicle: Vehicle
  stops: TripStop[]
  /** Curated trips carry every vehicle's road; a planned trip only the one asked for. */
  variants: Partial<Record<Vehicle, TripVariant>>
  terrain: TripTerrain
  lakes: TripLake[]
}

export const TRIPS = [sgDalat, sgPhanthiet, sgAnluong] as Trip[]

// Trips planned in this tab (/trips/plan), so the layout's scene can find them by slug like the curated ones.
const planned = new Map<string, Trip>()
export const rememberTrip = (trip: Trip) => planned.set(trip.slug, trip)

export const findTrip = (slug: string): Trip | undefined => TRIPS.find((t) => t.slug === slug) ?? planned.get(slug)

export const isVehicle = (value: unknown): value is Vehicle => VEHICLES.includes(value as Vehicle)
