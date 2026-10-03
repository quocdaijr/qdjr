import * as THREE from 'three'
import type {Trip, Vehicle} from '~/data/trips'
import {buildClouds} from '../cartoon/clouds'
import {createKit} from '../cartoon/kit'
import {buildSky, SUN_DIRECTION} from '../cartoon/sky'
import {panelAim} from '../framing'
import {pickable} from '../picking'
import type {SceneFactory} from '../types'
import {fitBoard, smoothPath} from './board'
import {elevationGrid} from './elevation'
import {roadProfile} from './profile'
import {buildScenery, type Land} from './scenery'
import {visualSpans} from './spans'
import {buildTimeline, driveBetween, legAt, markDwell, tripMarks} from './timeline'
import {buildVehicle} from './vehicles'

// A trip on the cartoon board: the real road of the chosen vehicle,
// simplified and fitted to a diorama block of the real land around it. The
// vehicle drives it on a loop, or to the stop or place the reader picks. Two
// views: the overview chase camera, and the driver's view from the vehicle.

export interface TripProgress {
  leg: number
  /** Index into tripMarks(variant) of the last place reached. */
  mark: number
  /** Standing at a place the reader drove to, until they let it drive on. */
  parked: boolean
}

export interface TripControl {
  view: 'overview' | 'driver'
  /** A mark (tripMarks index) to drive to and stay at; null drives the loop. */
  target: number | null
}

const FOG = {overview: {near: 50, far: 150}, driver: {near: 10, far: 75}}
const FOV = {overview: 42, driver: 62}
const CRUISE = 2.4 // world units per second at full speed: an unhurried toy pace
const MAX_DRIVE = 10 // seconds between two places at most; longer stretches speed up
const GOTO = {speed: 6, min: 1.2, max: 9} // a picked place: faster than the loop, seconds bounded
const ELEVATION_SCALE = 0.005 // world units per metre: 1 500 m of Da Lat plateau stands 7.5 tall
const ELEVATION_SMOOTHING = 2 // route points either side
const ROAD_LIFT = 0.05
const PATH_SMOOTHING = 2 // route points either side
const LAKE_LIFT = 0.03
const LAND_FLOOR_M = 1 // low land (the Mekong delta, Saigon: 0–5 m) stays land
// The open sea reads −10 m and deeper; a few metres below 0 inland are elevation-model noise in cities, not water.
const SEA_BELOW_M = -3
const URBAN_SHARE = 0.5 // of the road through town, for a city board
// Small lakes (Da Lat's Xuan Huong is 1.5 km: 0.3 units here) are stretched about their centre to a visible size, short of the road.
const LAKE_VIEW = {minSpan: 3, roadGap: 1.6, tries: 6, maxShift: 4}
// Overview: behind, above and a little to the side, looking ahead of the vehicle.
const CHASE = {back: 15, height: 11, side: 5, ahead: 3, chord: 0.04, shift: 5, drop: 4}
// Driver: eye height above the road per vehicle (model units), looking down the road.
const EYE: Record<Vehicle, number> = {motorbike: 1.3, car: 0.95, coach: 1.45}
const DRIVER = {lookAhead: 6, shift: 1.2, back: 0.3}
const SMOOTHING = {overview: 1.8, driver: 5}
const UP = new THREE.Vector3(0, 1, 0)

export interface TripSceneOptions {
  trip: Trip
  vehicle: Vehicle
  locale: 'vi' | 'en'
  /** Read every frame: the reader's view and destination. */
  control?: () => TripControl
  onProgress?: (progress: TripProgress) => void
}

function visibleRing(ring: THREE.Vector3[], centre: THREE.Vector3, road: THREE.Curve<THREE.Vector3>): THREE.Vector2[] {
  const xs = ring.map((p) => p.x)
  const zs = ring.map((p) => p.z)
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs), 1e-6)
  const roadPoints = road.getSpacedPoints(400)
  const place = (k: number, c: THREE.Vector3) => ring.map((p) => new THREE.Vector2(c.x + (p.x - centre.x) * k, c.z + (p.z - centre.z) * k))
  const clear = (shape: THREE.Vector2[]) => shape.every((p) => roadPoints.every((r) => Math.hypot(r.x - p.x, r.z - p.y) > LAKE_VIEW.roadGap))
  const near = roadPoints.reduce((a, r) => (r.distanceTo(centre) < a.distanceTo(centre) ? r : a))
  const away = new THREE.Vector3(centre.x - near.x, 0, centre.z - near.z).normalize()
  // Grow it; if that reaches the road (a lake by the road's end, like Xuan Huong), ease it away from the road, then shrink.
  for (let k = Math.max(1, LAKE_VIEW.minSpan / span), i = 0; i < LAKE_VIEW.tries && k > 1; i++, k = 1 + (k - 1) / 2) {
    for (let shift = 0; shift <= LAKE_VIEW.maxShift; shift += 0.5) {
      const shape = place(k, centre.clone().addScaledVector(away, shift))
      if (clear(shape)) return shape
    }
  }
  return place(1, centre)
}

const AUTOPLAY: TripControl = {view: 'overview', target: null}

export function createTripScene({trip, vehicle, locale, control = () => AUTOPLAY, onProgress}: TripSceneOptions): SceneFactory {
  const variant = trip.variants[vehicle]
  if (!variant) throw new Error(`trip ${trip.slug} has no road for ${vehicle}`)
  return ({isDark, aspect, reduceMotion = false, detail = 'high'}) => {
    const kit = createKit(isDark)
    const {colors} = kit
    const scene = new THREE.Scene()
    const fog = new THREE.Fog(colors.horizon, FOG.overview.near, FOG.overview.far)
    scene.fog = fog
    const sky = buildSky(colors, isDark)
    scene.add(sky)
    scene.add(new THREE.HemisphereLight(colors.skyTop, colors.grass, isDark ? 1.1 : 1.15))
    const sun = new THREE.DirectionalLight(colors.sunlight, isDark ? 1.1 : 1.5)
    sun.position.copy(SUN_DIRECTION).multiplyScalar(40)
    scene.add(sun)
    scene.userData.windTime = 0

    const camera = new THREE.PerspectiveCamera(FOV.overview, aspect, 0.05, 400)
    const board = fitBoard(variant.route)
    const path = smoothPath(board.points, PATH_SMOOTHING)
    // Spans need the road length, the road length needs the heights: measure flat first (heights barely change it).
    const spans = visualSpans(variant, new THREE.CatmullRomCurve3(path, false, 'centripetal').getLength())
    const heights = roadProfile(variant.elevation, spans, {scale: ELEVATION_SCALE, window: ELEVATION_SMOOTHING})
    const curve = new THREE.CatmullRomCurve3(path.map((p, i) => p.clone().setY(heights[i] + ROAD_LIFT)), false, 'centripetal')
    const length = curve.getLength()

    const grid = elevationGrid(trip.terrain)
    const land: Land = {
      scale: ELEVATION_SCALE,
      urban: variant.spans.filter((s) => s.kind === 'city').reduce((a, s) => a + s.to - s.from, 0) >= URBAN_SHARE,
      ground: (x, z) => {
        const metres = grid.at(...board.unproject(x, z))
        return (metres < SEA_BELOW_M ? metres - SEA_BELOW_M : Math.max(LAND_FLOOR_M, metres)) * ELEVATION_SCALE
      },
      coastal: (x, z) => grid.coastal(...board.unproject(x, z)),
      lakes: trip.lakes.map((lake) => {
        const ring = lake.ring.map(([lng, lat]) => board.project(lng, lat))
        const centre = ring.reduce((a, p) => a.add(p), new THREE.Vector3()).divideScalar(ring.length)
        const [lng, lat] = board.unproject(centre.x, centre.z)
        return {ring: visibleRing(ring, centre, curve), level: Math.max(0, grid.at(lng, lat)) * ELEVATION_SCALE + LAKE_LIFT}
      })
    }
    const name = (p: {name: {vi: string; en: string}}) => p.name[locale]
    const scenery = buildScenery(
      kit,
      curve,
      board,
      spans,
      trip.stops.map((s, i) => ({label: name(s), at: variant.stopsAt[i]})),
      variant.places.map((p) => ({label: name(p), at: p.at, kind: p.kind})),
      land,
      detail
    )
    const car = buildVehicle(kit, vehicle)
    const clouds = buildClouds(kit, detail)
    scene.add(scenery.group, car.group, clouds.mesh)

    const marks = tripMarks(variant)
    const timeline = buildTimeline(marks.map((m, i) => ({at: m.at, dwell: markDwell(m, i, marks.length)})), {length, cruise: CRUISE, maxDrive: MAX_DRIVE})
    const pickables = scenery.targets.map((t) => {
      const mark = marks.findIndex((m) => m.kind === t.kind && m.index === t.index)
      const label = t.kind === 'stop' ? name(trip.stops[t.index]) : name(variant.places[t.index])
      return pickable(t.object, {type: 'trip', mark, label})
    })

    // Motion: the loop, or a drive to a picked mark and a wait there.
    let time = 0
    let u = 0
    let drive: {from: number; to: number; mark: number; start: number; seconds: number} | null = null
    let reported = {leg: -1, mark: -1, parked: false}
    // Rebuilt while parked at a picked place (theme switch, detail downgrade): start there, not at the start of the road.
    const initial = control().target
    if (initial !== null && marks[initial]) {
      u = marks[initial].at
      drive = {from: u, to: u, mark: initial, start: 0, seconds: 0}
    }
    let cameraReady = false
    const eye = new THREE.Vector3()
    const look = new THREE.Vector3()
    const wantEye = new THREE.Vector3()
    const wantLook = new THREE.Vector3()
    const direction = new THREE.Vector3()
    const right = new THREE.Vector3()

    const move = (dt: number, target: number | null) => {
      if (!reduceMotion) time += dt
      if (target !== null && target !== drive?.mark && marks[target]) {
        const to = marks[target].at
        const seconds = reduceMotion ? 0 : THREE.MathUtils.clamp(((Math.PI / 2) * Math.abs(to - u) * length) / GOTO.speed, GOTO.min, GOTO.max)
        drive = {from: u, to, mark: target, start: time, seconds}
      }
      if (target === null && drive) {
        time = timeline.timeOf(drive.mark) // drive on from where it stands
        drive = null
      }
      if (!drive) {
        const point = timeline.at(time)
        return {u: point.u, mark: point.mark, speed: point.speed, sign: 1, parked: false}
      }
      const step = driveBetween(drive.from, drive.to, drive.seconds, time - drive.start, length)
      return {u: step.u, mark: step.done ? drive.mark : reported.mark, speed: step.speed, sign: Math.sign(drive.to - drive.from) || 1, parked: step.done}
    }

    const overview = (position: THREE.Vector3, at: number) => {
      // Heading from a chord around the vehicle, so the camera does not swing with every bend.
      direction.subVectors(curve.getPointAt(Math.min(1, at + CHASE.chord)), curve.getPointAt(Math.max(0, at - CHASE.chord))).setY(0)
      if (direction.lengthSq() < 1e-8) direction.copy(curve.getTangentAt(at)).setY(0)
      direction.normalize()
      right.crossVectors(direction, UP)
      wantEye.copy(position).addScaledVector(direction, -CHASE.back).addScaledVector(right, CHASE.side).addScaledVector(UP, CHASE.height)
      wantLook.copy(panelAim(position.clone().addScaledVector(direction, CHASE.ahead), wantEye, camera.aspect, {shift: CHASE.shift, drop: CHASE.drop}))
    }

    const driver = (position: THREE.Vector3, at: number, sign: number) => {
      const ahead = THREE.MathUtils.clamp(at + (sign * DRIVER.lookAhead) / length, 0, 1)
      const tangent = curve.getTangentAt(at).multiplyScalar(sign)
      wantEye.copy(position).addScaledVector(tangent, -DRIVER.back).addScaledVector(UP, EYE[vehicle])
      const target = Math.abs(ahead - at) * length < 1 ? position.clone().addScaledVector(tangent, DRIVER.lookAhead) : curve.getPointAt(ahead)
      target.y += EYE[vehicle] * 0.8
      wantLook.copy(panelAim(target, wantEye, camera.aspect, {shift: DRIVER.shift, drop: 0}))
    }

    return {
      scene,
      camera,
      pickables,
      play() {},
      update(dt, elapsed) {
        const wanted = control()
        const point = move(dt, wanted.target)
        u = point.u
        const leg = legAt(variant.stopsAt, u)
        const position = curve.getPointAt(u)
        const tangent = curve.getTangentAt(u).multiplyScalar(point.sign)
        const pitch = Math.atan2(tangent.y, Math.hypot(tangent.x, tangent.z))
        car.place(position, Math.atan2(-tangent.z, tangent.x), pitch, point.speed, dt)
        car.group.visible = wanted.view === 'overview' // the driver sits inside it
        for (const b of scenery.bores) b.visible = wanted.view === 'driver'
        scenery.update(reduceMotion ? 0 : elapsed)
        clouds.update(reduceMotion ? 0 : dt)
        kit.wind.time.value = reduceMotion ? 0 : elapsed
        scene.userData.windTime = kit.wind.time.value

        if (leg !== reported.leg || point.mark !== reported.mark || point.parked !== reported.parked) {
          reported = {leg, mark: point.mark, parked: point.parked}
          onProgress?.(reported)
        }

        if (wanted.view === 'driver') driver(position, u, point.sign)
        else overview(position, u)
        const k = !cameraReady || reduceMotion ? 1 : Math.min(1, dt * SMOOTHING[wanted.view])
        eye.lerp(wantEye, k)
        look.lerp(wantLook, k)
        fog.near = THREE.MathUtils.lerp(fog.near, FOG[wanted.view].near, k)
        fog.far = THREE.MathUtils.lerp(fog.far, FOG[wanted.view].far, k)
        if (Math.abs(camera.fov - FOV[wanted.view]) > 0.01) {
          camera.fov = THREE.MathUtils.lerp(camera.fov, FOV[wanted.view], k)
          camera.updateProjectionMatrix()
        }
        cameraReady = true
        camera.position.copy(eye)
        sky.position.copy(eye)
        camera.lookAt(look)
        camera.userData.look = look
      }
    }
  }
}
