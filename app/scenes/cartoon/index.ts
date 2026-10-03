import * as THREE from 'three'
import {journeyStations} from '~/data/journeyStations'
import {PROFILE_CONTENT} from '~/data/profile'
import {homeFraming, panelAim} from '../framing'
import {pickable} from '../picking'
import type {SceneFactory} from '../types'
import {buildClouds} from './clouds'
import {createKit} from './kit'
import {DEFAULT_MOTION, stepTrain, type TrainMotion} from './motion'
import {buildParticles} from './particles'
import {buildSky, SUN_DIRECTION} from './sky'
import {buildStations} from './stations'
import {buildTrack, sideAt} from './track'
import {buildTrain} from './train'
import {buildWorld} from './world'

// Station kinds and logos are language-independent (test/journeyStations.spec.ts).
const STATIONS = journeyStations(PROFILE_CONTENT.en)

const CAMERA_FOV = 42
// Depth haze; starts far enough out that the home view (camera fitted further
// back on wide screens) stays crisp.
const FOG = {near: 70, far: 190}
// Home page: the island from the front-right and above, fitted to the screen
// (framing.ts homeFraming). Calibration knobs below: the chase camera frames
// each station on the right half of the screen beside the /about panel.
const HOME_FROM = new THREE.Vector3(0.45, 0.6, 1)
const HOME_FLOOR = -3 // the fit ignores the rock that hangs under the island
const CHASE = {distance: 13, height: 8.5, back: 5, lookShift: 4.5, lookRise: 1.2, frame: 14, narrowDrop: 5}
// Projects stop: the camera slides along the track to the picked billboard and steps in.
const YARD_CHASE = {zoom: 3, weight: 0.85, shift: 2.5}
const CAMERA_SMOOTHING = 2.5
const POINTER_SWAY = 1.2

export const createCartoonScene: SceneFactory = ({isDark, aspect, reduceMotion = false, detail = 'high', loadAssets = true, stopLabels = []}) => {
  const kit = createKit(isDark)
  const {colors} = kit

  const scene = new THREE.Scene()
  scene.background = null // the painted sky dome is the backdrop
  scene.fog = new THREE.Fog(colors.horizon, FOG.near, FOG.far)
  const sky = buildSky(colors, isDark)
  scene.add(sky)
  scene.add(new THREE.HemisphereLight(colors.skyTop, colors.grass, isDark ? 1.1 : 1.15))
  // Warm afternoon sun by day, cool moonlight by night, from where the sky dome glows.
  const sun = new THREE.DirectionalLight(colors.sunlight, isDark ? 1.1 : 1.5)
  sun.position.copy(SUN_DIRECTION).multiplyScalar(40)
  scene.add(sun)
  scene.userData.windTime = 0

  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, aspect, 0.1, 400)

  const track = buildTrack(kit)
  const stations = buildStations(kit, track, STATIONS, stopLabels, loadAssets && typeof window !== 'undefined')
  const world = buildWorld(kit, track, stations.anchors, detail)
  const train = buildTrain(kit)
  const clouds = buildClouds(kit, detail)
  const particles = buildParticles(kit, detail)
  scene.add(world.group, world.sky, track.group, stations.group, train.group, clouds.mesh, particles.object)

  // Clickable: a station (building or platform) goes to its stop, a yard
  // billboard picks its project, the train whistles, the windmill spins.
  // Billboards sit inside the yard station; the nearest tagged ancestor wins.
  const byName = (name: string) => scene.getObjectByName(name)
  const pickables = [
    ...STATIONS.flatMap((_, i) => [byName(`station-${i}`), byName(`platform-${i}`)].map((o) => pickable(o!, {type: 'stop', stop: i}))),
    ...PROFILE_CONTENT.en.projects.map((_, k) => pickable(byName(`billboard-${k}`)!, {type: 'project', project: k})),
    pickable(train.group, {type: 'fun', id: 'whistle'}),
    pickable(world.windmill, {type: 'fun', id: 'spin'})
  ]

  const config = {length: track.length, ...DEFAULT_MOTION}
  let motion: TrainMotion = {u: 0, velocity: 0}
  let lastStop: number | null = null
  let direction: -1 | 0 | 1 = 0
  let cameraReady = false
  const eye = new THREE.Vector3()
  const look = new THREE.Vector3()
  const wantEye = new THREE.Vector3()
  const wantLook = new THREE.Vector3()
  const inward = new THREE.Vector3()
  const offset = new THREE.Vector3()

  const home = homeFraming(world.group, HOME_FROM, CAMERA_FOV, POINTER_SWAY, HOME_FLOOR)
  const overview = (pointer: {x: number; y: number}) => {
    const shot = home(camera.aspect, pointer)
    wantEye.copy(shot.eye)
    wantLook.copy(shot.look)
  }

  const anchorAt = (stop: number) => stations.anchors[THREE.MathUtils.clamp(Math.round(stop), 0, stations.anchors.length - 1)]

  const chase = (stop: number, focus: number | null) => {
    const anchor = anchorAt(stop)
    const picked = focus === null ? undefined : anchor.targets[focus]
    const trainAt = track.curve.getPointAt(motion.u)
    sideAt(track.curve, motion.u, inward)
    if (inward.dot(new THREE.Vector3(-trainAt.x, 0, -trainAt.z)) < 0) inward.negate()
    const tangent = track.curve.getTangentAt(motion.u)

    // Stand on the outer side of the train, a little behind, looking across it at the station.
    // On the yard, frame the track beside the picked billboard rather than the train itself.
    const along = picked ? tangent.dot(offset.subVectors(picked, trainAt)) : 0
    const subject = offset.copy(trainAt).addScaledVector(tangent, along)
    const distance = picked ? CHASE.distance - YARD_CHASE.zoom : CHASE.distance
    wantEye.copy(subject).addScaledVector(inward, -distance).addScaledVector(tangent, -CHASE.back)
    wantEye.y = CHASE.height
    const nearness = THREE.MathUtils.clamp(1 - trainAt.distanceTo(anchor.building) / CHASE.frame, 0, 1)
    wantLook.copy(subject).lerp(picked ?? anchor.building, (picked ? YARD_CHASE.weight : 0.7) * nearness)
    wantLook.y += CHASE.lookRise

    wantLook.copy(panelAim(wantLook, wantEye, camera.aspect, {shift: CHASE.lookShift + (picked ? YARD_CHASE.shift : 0), drop: CHASE.narrowDrop}))
  }

  return {
    scene,
    camera,
    pickables,
    play(id) {
      if (reduceMotion) return
      if (id === 'whistle') train.toot()
      if (id === 'spin') world.spin()
    },
    update(dt, elapsed, _progress, pointer, stop, focus) {
      const target = stop === null ? null : anchorAt(stop).u
      // Built while a stop is centred (vibe or theme switch on /about): start
      // parked there rather than re-running the line from the seam.
      if (!cameraReady && target !== null) motion = {u: target, velocity: 0}
      // The reader's direction, not the short way: a later stop (or arriving from the home page) is
      // ahead, an earlier one behind. Stations run forward round the loop in stop order.
      if (stop !== lastStop) {
        direction = stop === null ? 0 : lastStop === null || stop > lastStop ? 1 : -1
        lastStop = stop
      }
      motion = stepTrain(motion, target, dt, config, reduceMotion, direction)
      train.place(track.curve, track.length, motion.u, motion.velocity * track.length, dt)
      world.update(dt, elapsed)
      const still = reduceMotion ? 0 : dt
      clouds.update(still)
      particles.update(still, elapsed)
      kit.wind.time.value = reduceMotion ? 0 : elapsed
      scene.userData.windTime = kit.wind.time.value

      if (stop === null) overview(pointer)
      else chase(stop, focus)
      if (!cameraReady || reduceMotion) {
        eye.copy(wantEye)
        look.copy(wantLook)
        cameraReady = true
      } else {
        const k = Math.min(1, dt * CAMERA_SMOOTHING)
        eye.lerp(wantEye, k)
        look.lerp(wantLook, k)
      }
      camera.position.copy(eye)
      sky.position.copy(eye) // the dome always surrounds the camera, however far back it stands
      camera.lookAt(look)
      camera.userData.look = look // the reader's orbit/zoom turns around this (viewControl.ts)
    }
  }
}
