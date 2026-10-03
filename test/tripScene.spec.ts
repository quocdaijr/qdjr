import {describe, expect, test} from 'vitest'
import {TRIPS, VEHICLES} from '~/data/trips'
import {createTripScene, type TripProgress} from '~/scenes/trip'
import {tripMarks} from '~/scenes/trip/timeline'

const POINTER = {x: 0, y: 0}

describe.each(TRIPS.map((t) => [t.slug, t] as const))('%s', (_slug, trip) => {
  test('every vehicle has consistent data: stops and places in road order, one height per point', () => {
    for (const vehicle of VEHICLES) {
      const v = trip.variants[vehicle]
      expect(v.stopsAt).toHaveLength(trip.stops.length)
      expect(v.stopsAt[0]).toBe(0)
      expect(v.stopsAt.at(-1)).toBe(1)
      expect(v.elevation).toHaveLength(v.route.length)
      expect(v.places.map((p) => p.at)).toEqual([...v.places.map((p) => p.at)].sort((a, b) => a - b))
    }
  })

  test('a motorbike never takes an expressway', () => {
    expect(trip.variants.motorbike.spans.filter((s) => s.kind === 'motorway')).toEqual([])
  })

  test('drives the whole trip, reporting every place', () => {
    const seen: TripProgress[] = []
    const vehicle = trip.vehicle
    const built = createTripScene({trip, vehicle, locale: 'vi', onProgress: (p) => seen.push(p)})({isDark: false, aspect: 16 / 9, detail: 'low', loadAssets: false})
    for (let i = 0; i < 4000; i++) built.update(0.1, i * 0.1, 0, POINTER, null, null)
    expect(new Set(seen.map((p) => p.mark)).size).toBe(tripMarks(trip.variants[vehicle]).length)
    expect(built.camera.position.toArray().every(Number.isFinite)).toBe(true)
    expect(built.scene.getObjectByName(`vehicle-${vehicle}`)).toBeDefined()
  })

  test('stands still under reduced motion', () => {
    const built = createTripScene({trip, vehicle: 'motorbike', locale: 'en'})({isDark: true, aspect: 0.6, reduceMotion: true, detail: 'low'})
    built.update(0.1, 0, 0, POINTER, null, null)
    const before = built.camera.position.clone()
    for (let i = 0; i < 50; i++) built.update(0.1, i, 0, POINTER, null, null)
    expect(built.camera.position.distanceTo(before)).toBe(0)
  })
})

describe('reader control', () => {
  const trip = TRIPS[0]
  const variant = trip.variants[trip.vehicle]
  const marks = tripMarks(variant)

  test('drives to a picked place, waits there, then drives on from it', () => {
    let control = {view: 'overview' as 'overview' | 'driver', target: null as number | null}
    const seen: TripProgress[] = []
    const built = createTripScene({trip, vehicle: trip.vehicle, locale: 'vi', control: () => control, onProgress: (p) => seen.push(p)})({isDark: false, aspect: 1, detail: 'low'})
    built.update(0.1, 0, 0, POINTER, null, null)
    const last = marks.length - 2
    control = {...control, target: last}
    for (let i = 0; i < 200; i++) built.update(0.1, i * 0.1, 0, POINTER, null, null)
    expect(seen.at(-1)).toMatchObject({mark: last, parked: true})
    const parkedAt = built.camera.position.clone()
    for (let i = 0; i < 30; i++) built.update(0.1, 20 + i * 0.1, 0, POINTER, null, null)
    expect(built.camera.position.distanceTo(parkedAt)).toBeLessThan(0.01)
    control = {...control, target: null}
    for (let i = 0; i < 10; i++) built.update(0.1, 30 + i * 0.1, 0, POINTER, null, null) // a second later, not yet round the loop
    expect(seen.at(-1)!.parked).toBe(false)
    expect(seen.at(-1)!.mark).toBeGreaterThanOrEqual(last)
  })

  test("the driver's seat puts the camera low on the road and hides the vehicle", () => {
    const control = {view: 'driver' as const, target: null}
    const built = createTripScene({trip, vehicle: 'car', locale: 'vi', control: () => control})({isDark: false, aspect: 1, detail: 'low'})
    for (let i = 0; i < 100; i++) built.update(0.1, i * 0.1, 0, POINTER, null, null)
    const vehicle = built.scene.getObjectByName('vehicle')!
    expect(vehicle.visible).toBe(false)
    const car = built.scene.getObjectByName('vehicle-car')!
    expect(built.camera.position.distanceTo(car.position)).toBeLessThan(2)
  })

  test('a scene rebuilt while parked at a place starts there', () => {
    const control = {view: 'overview' as const, target: marks.length - 2}
    const seen: TripProgress[] = []
    const built = createTripScene({trip, vehicle: trip.vehicle, locale: 'vi', control: () => control, onProgress: (p) => seen.push(p)})({isDark: true, aspect: 1, detail: 'low'})
    built.update(0.1, 0, 0, POINTER, null, null)
    expect(seen[0]).toMatchObject({mark: marks.length - 2, parked: true})
  })

  test('towns and pins are clickable shortcuts to their marks', () => {
    const built = createTripScene({trip, vehicle: trip.vehicle, locale: 'vi'})({isDark: false, aspect: 1, detail: 'low'})
    const actions = built.pickables.map((o) => o.userData.action)
    expect(actions.length).toBeGreaterThanOrEqual(trip.stops.length)
    for (const a of actions) {
      expect(a.type).toBe('trip')
      expect(marks[a.mark]).toBeDefined()
      expect(a.label.length).toBeGreaterThan(0)
    }
  })
})

describe('low land', () => {
  test('the roadside on low land stays dry', async () => {
    const {terrainShape, SEA_LEVEL} = await import('~/scenes/trip/terrain')
    // A road 2 m above the sea (0.01 units), the sunk shoulder beside it.
    const samples = Array.from({length: 20}, (_, i) => ({x: i, z: 0, y: 0.06, tunnel: false}))
    const shape = terrainShape({samples, rivers: [], lakes: [], ground: () => 0.005})
    for (const d of [0, 0.5, 1, 2, 3]) expect(shape.heightAt(10, d)).toBeGreaterThan(SEA_LEVEL)
    expect(shape.isWater(10, 1)).toBe(false)
  })
})
