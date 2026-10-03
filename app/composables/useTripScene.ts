import type {Vehicle} from '~/data/trips'
import type {TripControl, TripProgress} from '~/scenes/trip'

// The channels between a /trips/[slug] page and the layout-level VibeScene.
export interface ActiveTrip {
  slug: string
  vehicle: Vehicle
  locale: 'vi' | 'en'
}

// active: the trip the scene should draw instead of the vibe scene, or null.
export const useActiveTrip = () => useState<ActiveTrip | null>('active-trip', () => null)

// progress: the leg being driven, the last place reached and whether the vehicle is parked there, reported by the scene.
export const useTripProgress = () => useState<TripProgress>('trip-progress', () => ({leg: 0, mark: 0, parked: false}))

// control: what the reader asked for — the camera view, and a stop or place to drive to (null: drive on its own).
export const useTripControl = () => useState<TripControl>('trip-control', () => ({view: 'overview', target: null}))
