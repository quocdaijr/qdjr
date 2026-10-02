import * as THREE from 'three'
import {journeyStations} from '~/data/journeyStations'
import {PROFILE_CONTENT} from '~/data/profile'
import type {SceneFactory} from '../types'
import {createKit} from './kit'
import {DEFAULT_MOTION, stepTrain, type TrainMotion} from './motion'
import {buildStations} from './stations'
import {buildTrack, sideAt} from './track'
import {buildTrain} from './train'
import {buildWorld} from './world'

// Station kinds and logos are language-independent (test/journeyStations.spec.ts).
const STATIONS = journeyStations(PROFILE_CONTENT.en)

const CAMERA_FOV = 42
const FOG = {near: 38, far: 95}
// Calibration knobs, tuned by screenshot: the overview keeps the island to the
// right of the hero text on /, the chase camera frames each station on the
// right half of the screen beside the /about panel.
const OVERVIEW = {position: new THREE.Vector3(12, 26, 38), look: new THREE.Vector3(-12, -1, 2)}
// Phones: the island sits below the hero text instead of behind it.
const OVERVIEW_NARROW = {position: new THREE.Vector3(0, 34, 52), look: new THREE.Vector3(0, 13, -6)}
const CHASE = {distance: 13, height: 8.5, back: 5, lookShift: 4.5, lookRise: 1.2, frame: 14, narrowDrop: 5}
const CAMERA_SMOOTHING = 2.5
const POINTER_SWAY = 1.2

export const createCartoonScene: SceneFactory = ({isDark, aspect, reduceMotion = false, detail = 'high', loadAssets = true}) => {
  const kit = createKit(isDark)
  const {colors} = kit

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(colors.sky)
  scene.fog = new THREE.Fog(colors.sky, FOG.near, FOG.far)
  scene.add(new THREE.HemisphereLight(colors.sky, colors.ground, isDark ? 0.45 : 1.1))
  const sun = new THREE.DirectionalLight(0xffffff, isDark ? 0.35 : 1.4)
  sun.position.set(12, 20, 8)
  scene.add(sun)

  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, aspect, 0.1, 220)

  const track = buildTrack(kit)
  const stations = buildStations(kit, track, STATIONS, loadAssets && typeof window !== 'undefined')
  const world = buildWorld(kit, track, stations.anchors, detail)
  const train = buildTrain(kit)
  scene.add(world.group, track.group, stations.group, train.group)

  const config = {length: track.length, ...DEFAULT_MOTION}
  let motion: TrainMotion = {u: 0, velocity: 0}
  let cameraReady = false
  const eye = new THREE.Vector3()
  const look = new THREE.Vector3()
  const wantEye = new THREE.Vector3()
  const wantLook = new THREE.Vector3()
  const inward = new THREE.Vector3()
  const right = new THREE.Vector3()
  const up = new THREE.Vector3(0, 1, 0)

  const overview = (pointer: {x: number; y: number}) => {
    const shot = camera.aspect < 1 ? OVERVIEW_NARROW : OVERVIEW
    wantEye.copy(shot.position).add(new THREE.Vector3(pointer.x * POINTER_SWAY, -pointer.y * POINTER_SWAY * 0.5, 0))
    wantLook.copy(shot.look)
  }

  const anchorAt = (stop: number) => stations.anchors[THREE.MathUtils.clamp(Math.round(stop), 0, stations.anchors.length - 1)]

  const chase = (stop: number) => {
    const anchor = anchorAt(stop)
    const trainAt = track.curve.getPointAt(motion.u)
    sideAt(track.curve, motion.u, inward)
    if (inward.dot(new THREE.Vector3(-trainAt.x, 0, -trainAt.z)) < 0) inward.negate()
    const tangent = track.curve.getTangentAt(motion.u)

    // Stand on the outer side of the train, a little behind, looking across it at the station.
    wantEye.copy(trainAt).addScaledVector(inward, -CHASE.distance).addScaledVector(tangent, -CHASE.back)
    wantEye.y = CHASE.height
    const nearness = THREE.MathUtils.clamp(1 - trainAt.distanceTo(anchor.building) / CHASE.frame, 0, 1)
    wantLook.copy(trainAt).lerp(anchor.building, 0.7 * nearness)
    wantLook.y += CHASE.lookRise

    // Wide screens: shift the aim left so the subject sits right of centre,
    // clear of the text panel. Phones: the panel is centred, so aim below the
    // subject to lift it into the strip above the panel.
    const wide = THREE.MathUtils.clamp((camera.aspect - 0.8) / 0.8, 0, 1)
    right.subVectors(wantLook, wantEye).cross(up).normalize()
    wantLook.addScaledVector(right, -CHASE.lookShift * wide)
    wantLook.y -= CHASE.narrowDrop * (1 - wide)
  }

  return {
    scene,
    camera,
    update(dt, elapsed, _progress, pointer, stop) {
      const target = stop === null ? null : anchorAt(stop).u
      // Built while a stop is centred (vibe or theme switch on /about): start
      // parked there rather than re-running the line from the seam.
      if (!cameraReady && target !== null) motion = {u: target, velocity: 0}
      motion = stepTrain(motion, target, dt, config, reduceMotion)
      train.place(track.curve, track.length, motion.u, motion.velocity * track.length, dt)
      world.update(dt, elapsed)

      if (stop === null) overview(pointer)
      else chase(stop)
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
      camera.lookAt(look)
    }
  }
}
