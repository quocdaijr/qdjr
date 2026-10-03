import * as THREE from 'three'
import {projectsStopIndex} from '~/data/journeyStations'
import {PROFILE_CONTENT} from '~/data/profile'
import {mulberry32} from '../random'
import type {SceneFactory} from '../types'
import {buildBodies} from './bodies'
import {chaseShot, type Shot} from './chase'
import {buildEarthSystem} from './earth'
import {AMBIENT_DURATION, createStreaks, nextAmbientDelay, PICK_DURATION, type Vec3} from './streaks'

// Galaxy vibe: every /about section is a body of the solar system (the Sun,
// then planets) and the camera glides from one to the next. Projects is Earth,
// with one orbiter per project; picking one zooms onto it.
const PALETTE = {
  dark: {bg: 0x0a0920, sun: 0xffb347, star: 0xcfd3ff, orbit: 0x5a5c8a, starOpacity: 0.9, ambient: 0.22, streak: 0xffffff, label: '#cfd3ff'},
  light: {bg: 0xedeef8, sun: 0xe58f1a, star: 0x3b3d6b, orbit: 0x9a9cc4, starOpacity: 0.45, ambient: 0.6, streak: 0x2b2d5b, label: '#2b2d5b'}
} as const

const SEED = 20261003
// ponytail: tuned by eye for ACES tone mapping; raise if planets look muddy, lower if the inner ones blow out.
const SUN_INTENSITY_DARK = 420
const SUN_INTENSITY_LIGHT = 260
const STARS = {count: 2000, min: 60, max: 120}
const CAMERA_FOV = 50
const CAMERA_GLIDE = 1.8
// Home page overview: looking left of and below the sun pushes the system to
// the lower right of the viewport, clear of the hero text.
const OVERVIEW = {radius: 24, height: 9, look: new THREE.Vector3(-6, -1.5, 0), sway: {x: 1.2, y: 0.8}}

const PROJECTS = PROFILE_CONTENT.en.projects
const PROJECTS_STOP = projectsStopIndex(PROFILE_CONTENT.en)
// A pick sends a shooting star straight past the orbiter.
const PASS = new THREE.Vector3(-2.4, 1.6, -1)
const ORBITER_STANDOFF = 0.6
// Ambient shooting stars cross the view, in camera space.
const AMBIENT_FROM = {x: [-18, 18], y: [6, 14], z: -45} as const
const AMBIENT_TRAVEL = new THREE.Vector3(-16, -9, 0)

function starfield(color: number, opacity: number, random: () => number): THREE.Points {
  const positions = new Float32Array(STARS.count * 3)
  for (let i = 0; i < STARS.count; i++) {
    const r = STARS.min + random() * (STARS.max - STARS.min)
    const theta = random() * Math.PI * 2
    const phi = Math.acos(2 * random() - 1)
    positions.set([r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)], i * 3)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return new THREE.Points(geometry, new THREE.PointsMaterial({color, size: 0.45, sizeAttenuation: true, transparent: true, opacity, depthWrite: false}))
}

export const createGalaxyScene: SceneFactory = ({isDark, aspect, reduceMotion = false, loadAssets = true}) => {
  const colors = isDark ? PALETTE.dark : PALETTE.light
  const random = mulberry32(SEED)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(colors.bg)
  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, aspect, 0.05, 400)
  scene.add(new THREE.AmbientLight(0xffffff, colors.ambient))
  scene.add(new THREE.PointLight(colors.sun, isDark ? SUN_INTENSITY_DARK : SUN_INTENSITY_LIGHT, 0, 2))

  const bodies = buildBodies(colors, random)
  const earthSystem = buildEarthSystem(PROJECTS, colors.label, loadAssets && typeof window !== 'undefined')
  bodies.earth.add(earthSystem.group)
  const streaks = createStreaks(colors.streak, colors.bg)
  scene.add(bodies.group, starfield(colors.star, colors.starOpacity, random), streaks.group)

  const eye = new THREE.Vector3()
  const look = new THREE.Vector3()
  // The subject keeps orbiting; the camera rides along with it so smoothing
  // never trails behind a moving body.
  let subject: THREE.Object3D | null = null
  const subjectAt = new THREE.Vector3()
  const moved = new THREE.Vector3()
  let ready = false
  let lastFocus: number | null = null
  let nextAmbient = nextAmbientDelay(random)

  const overviewShot = (pointer: {x: number; y: number}): Shot => ({
    eye: new THREE.Vector3(pointer.x * OVERVIEW.sway.x, OVERVIEW.height - pointer.y * OVERVIEW.sway.y, OVERVIEW.radius),
    look: OVERVIEW.look.clone()
  })

  const subjectOf = (stop: number, focus: number | null) => {
    const i = THREE.MathUtils.clamp(Math.round(stop), 0, bodies.anchors.length - 1)
    const picked = i === PROJECTS_STOP && focus !== null ? earthSystem.orbiters[focus] : undefined
    return {i, picked, object: picked ?? bodies.anchors[i]}
  }

  const stopShot = (stop: number, focus: number | null): Shot => {
    const {i, picked, object} = subjectOf(stop, focus)
    const target = object.getWorldPosition(new THREE.Vector3())
    if (!picked) return chaseShot(target, bodies.radii[i], camera.aspect)
    // Stand outside the orbit, looking back at the craft with Earth behind it
    // (towards the sun could put the camera inside Earth).
    const outward = target.clone().sub(bodies.earth.getWorldPosition(new THREE.Vector3()))
    return chaseShot(target, picked.userData.radius as number, camera.aspect, {base: ORBITER_STANDOFF, towards: outward})
  }

  const ambient = (elapsed: number) => {
    const lerp = (r: readonly [number, number]) => r[0] + random() * (r[1] - r[0])
    const start = new THREE.Vector3(lerp(AMBIENT_FROM.x), lerp(AMBIENT_FROM.y), AMBIENT_FROM.z)
    const from = camera.localToWorld(start.clone())
    const to = camera.localToWorld(start.add(AMBIENT_TRAVEL))
    streaks.launch(from.toArray() as Vec3, to.toArray() as Vec3, elapsed, AMBIENT_DURATION)
  }

  const passBy = (orbiter: THREE.Object3D, elapsed: number) => {
    const p = orbiter.getWorldPosition(new THREE.Vector3())
    streaks.launch(p.clone().add(PASS).toArray() as Vec3, p.clone().sub(PASS).toArray() as Vec3, elapsed, PICK_DURATION)
  }

  return {
    scene,
    camera,
    update(dt, elapsed, _progress, pointer, stop, focus) {
      const picked = stop === PROJECTS_STOP ? focus : null
      const still = reduceMotion ? 0 : dt
      bodies.update(still)
      earthSystem.update(still, picked)
      scene.updateMatrixWorld()

      const current = stop === null ? null : subjectOf(stop, picked).object
      if (current && current === subject) {
        moved.subVectors(current.getWorldPosition(new THREE.Vector3()), subjectAt)
        eye.add(moved)
        look.add(moved)
      }
      subject = current
      if (current) current.getWorldPosition(subjectAt)

      const shot = stop === null ? overviewShot(pointer) : stopShot(stop, picked)
      const instant = !ready || reduceMotion
      const k = instant ? 1 : Math.min(1, dt * CAMERA_GLIDE)
      eye.lerp(shot.eye, k)
      look.lerp(shot.look, k)
      camera.position.copy(eye)
      camera.lookAt(look)
      camera.updateMatrixWorld()

      if (picked !== null && picked !== lastFocus && !instant) passBy(earthSystem.orbiters[picked], elapsed)
      lastFocus = picked
      if (!reduceMotion && elapsed >= nextAmbient) {
        ambient(elapsed)
        nextAmbient = elapsed + nextAmbientDelay(random)
      }
      streaks.update(elapsed)
      ready = true
    }
  }
}
