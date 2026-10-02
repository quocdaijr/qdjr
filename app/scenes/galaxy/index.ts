import * as THREE from 'three'
import {projectsStopIndex} from '~/data/journeyStations'
import {PROFILE_CONTENT} from '~/data/profile'
import {panelAim} from '../framing'
import {approach, type SceneFactory} from '../types'
import {buildConstellation, CONSTELLATION_CENTRE} from './constellation'
import {AMBIENT_DURATION, createStreaks, nextAmbientDelay, PICK_DURATION, type Vec3} from './streaks'

const PALETTE = {
  dark: {bg: 0x0a0920, sun: 0xffb347, star: 0xcfd3ff, orbit: 0x5a5c8a, starOpacity: 0.9, ambient: 0.22, streak: 0xffffff, bright: 0xfff4d6, label: '#cfd3ff'},
  light: {bg: 0xedeef8, sun: 0xe58f1a, star: 0x3b3d6b, orbit: 0x9a9cc4, starOpacity: 0.45, ambient: 0.6, streak: 0x2b2d5b, bright: 0x2b2d5b, label: '#2b2d5b'}
} as const

interface PlanetSpec {
  radius: number
  distance: number
  speed: number // radians per second around the sun
  tilt: number // orbit plane tilt, radians
  color: number
  ring?: boolean
}

const PLANETS: readonly PlanetSpec[] = [
  {radius: 0.28, distance: 3.2, speed: 0.5, tilt: 0.05, color: 0xc98b5e},
  {radius: 0.42, distance: 4.6, speed: 0.36, tilt: -0.08, color: 0x7aa6d9},
  {radius: 0.36, distance: 6.1, speed: 0.28, tilt: 0.12, color: 0xd9b96b},
  {radius: 0.9, distance: 8.6, speed: 0.18, tilt: -0.04, color: 0x8c6ad9, ring: true},
  {radius: 0.6, distance: 11.2, speed: 0.13, tilt: 0.1, color: 0x5fb0a0},
  {radius: 0.5, distance: 13.4, speed: 0.1, tilt: -0.14, color: 0xd97a7a},
  {radius: 0.34, distance: 15.6, speed: 0.07, tilt: 0.07, color: 0xb4b4c8}
]

const SUN_RADIUS = 1.2
// ponytail: tuned by eye for ACES tone mapping; raise if planets look muddy, lower if the inner ones blow out.
const SUN_INTENSITY_DARK = 420
const SUN_INTENSITY_LIGHT = 260
const STAR_COUNT = 2000
const STAR_SHELL_MIN = 60
const STAR_SHELL_MAX = 120
const BELT_COUNT = 600
const BELT_INNER = 9.6
const BELT_OUTER = 10.4
const CAMERA_FOV = 50
const CAMERA_START = {radius: 24, height: 9}
const CAMERA_END = {radius: 11, height: 3}
const CAMERA_SWEEP = Math.PI * 0.9
// Looking left of and below the sun pushes the system to the lower right of the
// viewport, clear of the left-biased hero text on /.
const LOOK_AT = new THREE.Vector3(-6, -1.5, 0)

// The /about Projects stop: the camera leaves the journey orbit for the
// constellations and keeps the picked star right of the text panel.
const PROJECTS = PROFILE_CONTENT.en.projects
const PROJECTS_STOP = projectsStopIndex(PROFILE_CONTENT.en)
const PROJECTS_CAMERA = {back: 22, overview: 28, rise: 1.5, shift: 10, drop: 3.5, blend: 2.5, glide: 2.5}
// A picked project's shooting star falls in from up and to the left of its star.
const PICK_FROM = new THREE.Vector3(-14, 9, -6)
// Ambient shooting stars cross the view, in camera space.
const AMBIENT_FROM = {x: [-18, 18], y: [6, 14], z: -45} as const
const AMBIENT_TRAVEL = new THREE.Vector3(-16, -9, 0)

function randomInShell(min: number, max: number): [number, number, number] {
  const r = min + Math.random() * (max - min)
  const theta = Math.random() * Math.PI * 2
  const phi = Math.acos(2 * Math.random() - 1)
  return [r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)]
}

function points(count: number, place: () => [number, number, number], color: number, size: number, opacity: number): THREE.Points {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) positions.set(place(), i * 3)
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.PointsMaterial({color, size, sizeAttenuation: true, transparent: true, opacity, depthWrite: false})
  return new THREE.Points(geometry, material)
}

export const createGalaxyScene: SceneFactory = ({isDark, aspect, reduceMotion = false, loadAssets = true}) => {
  const colors = isDark ? PALETTE.dark : PALETTE.light

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(colors.bg)

  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, aspect, 0.1, 400)

  scene.add(new THREE.AmbientLight(0xffffff, colors.ambient))
  const sunLight = new THREE.PointLight(colors.sun, isDark ? SUN_INTENSITY_DARK : SUN_INTENSITY_LIGHT, 0, 2)
  scene.add(sunLight)

  const sun = new THREE.Mesh(new THREE.SphereGeometry(SUN_RADIUS, 32, 16), new THREE.MeshBasicMaterial({color: colors.sun}))
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(SUN_RADIUS * 1.6, 32, 16),
    new THREE.MeshBasicMaterial({color: colors.sun, transparent: true, opacity: 0.18, side: THREE.BackSide, depthWrite: false})
  )
  scene.add(sun, halo)

  const pivots = PLANETS.map((spec) => {
    const pivot = new THREE.Object3D()
    pivot.rotation.x = spec.tilt
    pivot.rotation.y = Math.random() * Math.PI * 2

    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(spec.radius, 24, 16),
      new THREE.MeshStandardMaterial({color: spec.color, roughness: 0.9, metalness: 0})
    )
    planet.position.x = spec.distance
    pivot.add(planet)

    if (spec.ring) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(spec.radius * 1.4, spec.radius * 2.2, 48),
        new THREE.MeshBasicMaterial({color: spec.color, transparent: true, opacity: 0.5, side: THREE.DoubleSide})
      )
      ring.rotation.x = Math.PI / 2.4
      planet.add(ring)
    }

    const orbit = new THREE.Mesh(
      new THREE.RingGeometry(spec.distance - 0.015, spec.distance + 0.015, 128),
      new THREE.MeshBasicMaterial({color: colors.orbit, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false})
    )
    orbit.rotation.x = Math.PI / 2
    pivot.add(orbit)

    scene.add(pivot)
    return {pivot, planet, speed: spec.speed}
  })

  const belt = points(
    BELT_COUNT,
    () => {
      const r = BELT_INNER + Math.random() * (BELT_OUTER - BELT_INNER)
      const a = Math.random() * Math.PI * 2
      return [Math.cos(a) * r, (Math.random() - 0.5) * 0.3, Math.sin(a) * r]
    },
    colors.orbit,
    0.12,
    0.8
  )
  scene.add(belt)

  scene.add(points(STAR_COUNT, () => randomInShell(STAR_SHELL_MIN, STAR_SHELL_MAX), colors.star, 0.45, colors.starOpacity))

  const constellation = buildConstellation(PROJECTS, {star: colors.bright, orbit: colors.orbit, label: colors.label}, loadAssets && typeof window !== 'undefined')
  const streaks = createStreaks(colors.streak, colors.bg)
  scene.add(constellation.group, streaks.group)

  const journeyEye = new THREE.Vector3()
  const projectsEye = new THREE.Vector3()
  const projectsLook = new THREE.Vector3()
  const wantEye = new THREE.Vector3()
  const wantLook = new THREE.Vector3()
  const look = new THREE.Vector3()
  let blend = 0
  let ready = false
  let lastFocus: number | null = null
  let nextAmbient = nextAmbientDelay(Math.random)

  const journeyCamera = (progress: number, pointer: {x: number; y: number}) => {
    const angle = progress * CAMERA_SWEEP
    const radius = CAMERA_START.radius + (CAMERA_END.radius - CAMERA_START.radius) * progress
    const height = CAMERA_START.height + (CAMERA_END.height - CAMERA_START.height) * progress
    journeyEye.set(Math.sin(angle) * radius + pointer.x * 1.2, height - pointer.y * 0.8, Math.cos(angle) * radius)
  }

  const projectsCamera = (focus: number | null) => {
    const star = focus === null ? undefined : constellation.stars[focus]
    const subject = star ? star.position : CONSTELLATION_CENTRE
    wantEye.set(subject.x, CONSTELLATION_CENTRE.y + PROJECTS_CAMERA.rise, CONSTELLATION_CENTRE.z + (star ? PROJECTS_CAMERA.back : PROJECTS_CAMERA.overview))
    wantLook.copy(panelAim(subject, wantEye, camera.aspect, PROJECTS_CAMERA))
  }

  const ambient = (elapsed: number) => {
    if (elapsed < nextAmbient) return
    nextAmbient = elapsed + nextAmbientDelay(Math.random)
    const lerp = (r: readonly [number, number]) => r[0] + Math.random() * (r[1] - r[0])
    const from = camera.localToWorld(new THREE.Vector3(lerp(AMBIENT_FROM.x), lerp(AMBIENT_FROM.y), AMBIENT_FROM.z))
    const to = camera.localToWorld(new THREE.Vector3(lerp(AMBIENT_FROM.x), lerp(AMBIENT_FROM.y), AMBIENT_FROM.z).add(AMBIENT_TRAVEL))
    streaks.launch(from.toArray() as Vec3, to.toArray() as Vec3, elapsed, AMBIENT_DURATION)
  }

  return {
    scene,
    camera,
    update(dt, elapsed, progress, pointer, stop, focus) {
      pivots.forEach(({pivot, planet, speed}) => {
        pivot.rotation.y += dt * speed
        planet.rotation.y += dt * 0.5
      })
      belt.rotation.y += dt * 0.05

      const onProjects = stop === PROJECTS_STOP
      const picked = onProjects ? focus : null
      const instant = !ready || reduceMotion
      blend = instant ? (onProjects ? 1 : 0) : approach(blend, onProjects ? 1 : 0, dt, PROJECTS_CAMERA.blend)

      // A new pick fires a shooting star at its star (not on the first frame of a rebuilt scene).
      if (picked !== null && picked !== lastFocus && !instant) {
        const to = constellation.stars[picked].position
        streaks.launch(to.clone().add(PICK_FROM).toArray() as Vec3, to.toArray() as Vec3, elapsed, PICK_DURATION)
      }
      lastFocus = picked
      if (!reduceMotion) ambient(elapsed)
      streaks.update(elapsed)
      constellation.update(dt, picked, instant)
      constellation.setPresence(blend)

      journeyCamera(progress, pointer)
      projectsCamera(picked)
      const glide = instant ? 1 : Math.min(1, dt * PROJECTS_CAMERA.glide)
      projectsEye.lerp(wantEye, glide)
      projectsLook.lerp(wantLook, glide)
      camera.position.lerpVectors(journeyEye, projectsEye, blend)
      look.lerpVectors(LOOK_AT, projectsLook, blend)
      camera.lookAt(look)
      camera.updateMatrixWorld()
      ready = true
    }
  }
}
