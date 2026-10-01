import * as THREE from 'three'
import type {SceneFactory} from './types'

// Hex because THREE.Color cannot parse oklch(); mirrors tokens.css terminal.
const PALETTE = {
  dark: {bg: 0x0b1410, grid: 0x39ff8a, solid: 0x1b3b2a},
  light: {bg: 0xeef5f0, grid: 0x13884a, solid: 0xb9d6c4}
} as const

const GRID_SIZE = 80
const GRID_SEGMENTS = 60
const GRID_Y = -2
const FLOW_SPEED = 2.2 // world units per second toward the camera
const FOG_NEAR = 6
const FOG_FAR = 46
const ROAD_HALF_WIDTH = 6
const Z_PERIODS = 3 // height must repeat every GRID_SIZE in z so the two tiles loop seamlessly
const CAMERA_FOV = 60
const CAMERA_BASE_Y = 1.6
const CAMERA_BASE_Z = 8
const JOURNEY_RISE = 9 // how high the camera climbs over the /about journey
const JOURNEY_ADVANCE = 6
const POINTER_SWAY = 0.6
const ICO_POSITION = new THREE.Vector3(6, 1.8, -12) // right of the hero text column
const ICO_SPIN = 0.25

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

export const createTerminalScene: SceneFactory = ({isDark, aspect}) => {
  const colors = isDark ? PALETTE.dark : PALETTE.light

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(colors.bg)
  scene.fog = new THREE.Fog(colors.bg, FOG_NEAR, FOG_FAR)

  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, aspect, 0.1, 200)

  // Two tiles of the same terrain, leap-frogging so the flow never shows an edge.
  const tileA = buildTerrain(colors.grid)
  const tileB = buildTerrain(colors.grid)
  scene.add(tileA, tileB)

  const ico = new THREE.Group()
  ico.add(
    new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 1), new THREE.MeshBasicMaterial({color: colors.solid})),
    new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 1), new THREE.MeshBasicMaterial({color: colors.grid, wireframe: true}))
  )
  ico.position.copy(ICO_POSITION)
  scene.add(ico)

  const lookAt = new THREE.Vector3()

  return {
    scene,
    camera,
    update(dt, elapsed, progress, pointer) {
      const offset = (elapsed * FLOW_SPEED) % GRID_SIZE
      tileA.position.z = offset
      tileB.position.z = offset - GRID_SIZE

      ico.rotation.y += dt * ICO_SPIN
      ico.rotation.x += dt * ICO_SPIN * 0.4
      ico.position.y = ICO_POSITION.y + Math.sin(elapsed * 0.9) * 0.25

      camera.position.set(
        pointer.x * POINTER_SWAY,
        CAMERA_BASE_Y + progress * JOURNEY_RISE - pointer.y * 0.3,
        CAMERA_BASE_Z - progress * JOURNEY_ADVANCE
      )
      lookAt.set(0, 0.5 - progress * 2, -20)
      camera.lookAt(lookAt)
    }
  }
}
