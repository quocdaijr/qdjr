import * as THREE from 'three'
import {journeyStations, projectsStopIndex} from '~/data/journeyStations'
import {PROFILE_CONTENT} from '~/data/profile'
import {panelAim} from '../framing'
import {pickable} from '../picking'
import type {SceneFactory} from '../types'
import {layoutArchitecture} from './architecture'
import {buildArchitecture} from './nodes'
import {createPackets} from './packets'

// Coding vibe: a wireframe grid flows toward the camera; above it floats a
// system-design map of the /about journey (client → gateway → one service per
// career stage → the projects cluster → the contact queue). The camera glides
// from node to node; on Projects, picking a project zooms onto its pod.
// Hex because THREE.Color cannot parse oklch(); mirrors tokens.css terminal.
const PALETTE = {
  dark: {bg: 0x0b1410, grid: 0x39ff8a, solid: 0x1b3b2a, label: '#39ff8a'},
  light: {bg: 0xeef5f0, grid: 0x13884a, solid: 0xb9d6c4, label: '#0e6a39'}
} as const

const GRID_SIZE = 80
const GRID_SEGMENTS = 60
const GRID_Y = -2
const FLOW_SPEED = 2.2 // world units per second toward the camera
const FOG_NEAR = 8
const FOG_FAR = 70
const ROAD_HALF_WIDTH = 6
const Z_PERIODS = 3 // height must repeat every GRID_SIZE in z so the two tiles loop seamlessly
const CAMERA_FOV = 60
const CAMERA_GLIDE = 2
const POINTER_SWAY = 0.6
// Home page: the whole map, right of the hero text.
const OVERVIEW = {eye: new THREE.Vector3(-12, 18, 22), look: new THREE.Vector3(-27, 0, -20)}
const OFFSET = new THREE.Vector3(0, 3.5, 9)
const POD_SCALE = 0.6
const FRAME = {shift: 3.6, drop: 2.2}
const CRON = {position: new THREE.Vector3(-14, 6.5, -19), spin: 0.8}
// The Projects panel is wider, so its subject sits farther right.
const WIDE_PANEL_SHIFT = 1.6

const CONTENT = PROFILE_CONTENT.en
const PROJECTS_STOP = projectsStopIndex(CONTENT)
const ARCH = layoutArchitecture(journeyStations(CONTENT), CONTENT.timeline, CONTENT.projects)
// Pool labels: the employer's short name from the timeline.
const POOL_NAMES = ARCH.pools.map((group) => CONTENT.timeline.find((t) => t.org === group)?.short ?? group)

function heightAt(x: number, z: number): number {
  const road = Math.min(1, Math.abs(x) / ROAD_HALF_WIDTH)
  const zWave = Math.cos((z * Z_PERIODS * Math.PI * 2) / GRID_SIZE)
  return road * (Math.sin(x * 0.35) * 1.4 + zWave * 0.9)
}

function buildTerrain(color: number): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE, GRID_SEGMENTS, GRID_SEGMENTS)
  geometry.rotateX(-Math.PI / 2)
  const position = geometry.attributes.position
  for (let i = 0; i < position.count; i++) {
    position.setY(i, heightAt(position.getX(i), position.getZ(i)))
  }
  position.needsUpdate = true
  const material = new THREE.MeshBasicMaterial({color, wireframe: true, transparent: true, opacity: 0.55})
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.y = GRID_Y
  return mesh
}

export const createTerminalScene: SceneFactory = ({isDark, aspect, reduceMotion = false, detail = 'high', loadAssets = true}) => {
  const colors = isDark ? PALETTE.dark : PALETTE.light

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(colors.bg)
  scene.fog = new THREE.Fog(colors.bg, FOG_NEAR, FOG_FAR)
  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, aspect, 0.1, 200)

  // Two tiles of the same terrain, leap-frogging so the flow never shows an edge.
  const tileA = buildTerrain(colors.grid)
  const tileB = buildTerrain(colors.grid)
  const map = buildArchitecture(ARCH, colors, POOL_NAMES, loadAssets && typeof window !== 'undefined')
  const packets = createPackets(ARCH, colors.grid, detail)
  scene.add(tileA, tileB, map.group, packets.mesh)

  // A little cron job spinning beside the map: the clickable easter egg.
  const cron = new THREE.Mesh(new THREE.TorusKnotGeometry(0.45, 0.13, 64, 8), new THREE.MeshBasicMaterial({color: colors.grid, wireframe: true}))
  cron.position.copy(CRON.position)
  cron.name = 'cron'
  scene.add(cron)

  // Clickable: a node goes to its stop, a pod picks its project (pods are
  // children of the cluster node; the nearest tagged ancestor wins), the cron
  // job sends a burst of requests through the whole map.
  const pickables = [
    ...map.anchors.map((o, i) => pickable(o, {type: 'stop', stop: i})),
    ...map.pods.map((o, k) => pickable(o, {type: 'project', project: k})),
    pickable(cron, {type: 'fun', id: 'burst'})
  ]

  const eye = new THREE.Vector3()
  const look = new THREE.Vector3()
  let ready = false
  let lastStop: number | null = null

  const stopShot = (stop: number, focus: number | null) => {
    const i = THREE.MathUtils.clamp(Math.round(stop), 0, map.anchors.length - 1)
    const pod = i === PROJECTS_STOP && focus !== null ? map.pods[focus] : undefined
    const scale = pod ? POD_SCALE : map.scales[i]
    const at = (pod ?? map.anchors[i]).getWorldPosition(new THREE.Vector3())
    const to = at.clone().addScaledVector(OFFSET, scale)
    const shift = FRAME.shift * scale * (i === PROJECTS_STOP ? WIDE_PANEL_SHIFT : 1)
    return {eye: to, look: panelAim(at, to, camera.aspect, {shift, drop: FRAME.drop * scale})}
  }

  const overviewShot = (pointer: {x: number; y: number}) => ({
    eye: OVERVIEW.eye.clone().add(new THREE.Vector3(pointer.x * POINTER_SWAY, -pointer.y * POINTER_SWAY * 0.5, 0)),
    look: OVERVIEW.look.clone()
  })

  return {
    scene,
    camera,
    pickables,
    play(id, elapsed) {
      if (!reduceMotion && id === 'burst') packets.flood(elapsed)
    },
    update(dt, elapsed, _progress, pointer, stop, focus) {
      const t = reduceMotion ? 0 : elapsed
      const offset = (t * FLOW_SPEED) % GRID_SIZE
      tileA.position.z = offset
      tileB.position.z = offset - GRID_SIZE

      const picked = stop === PROJECTS_STOP ? focus : null
      map.setFocus(stop === PROJECTS_STOP ? picked : null)
      // A burst along the wire just travelled (forward or back).
      if (!reduceMotion && ready && stop !== null && lastStop !== null && stop !== lastStop) {
        const edge: [number, number] = stop > lastStop ? [stop - 1, stop] : [stop, stop + 1]
        if (edge[0] >= 0 && edge[1] < ARCH.nodes.length) packets.burst(edge, elapsed)
      }
      lastStop = stop
      packets.update(t)
      cron.rotation.set(t * CRON.spin * 0.6, t * CRON.spin, 0)
      scene.updateMatrixWorld()

      const shot = stop === null ? overviewShot(pointer) : stopShot(stop, picked)
      const k = !ready || reduceMotion ? 1 : Math.min(1, dt * CAMERA_GLIDE)
      eye.lerp(shot.eye, k)
      look.lerp(shot.look, k)
      camera.position.copy(eye)
      camera.lookAt(look)
      camera.updateMatrixWorld()
      ready = true
    }
  }
}
