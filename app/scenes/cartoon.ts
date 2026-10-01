import * as THREE from 'three'
import type {SceneFactory} from './types'

const PALETTE = {
  dark: {sky: 0x2b2320, ground: 0x6b4a35, grass: 0x7fae63, leaf: 0x4f8a4b, trunk: 0x5a3b2a, wall: 0xf3e5c8, roof: 0xc9633c, cloud: 0xd9cfc4, window: 0xffb15c},
  light: {sky: 0xf6ecd8, ground: 0x8d5e43, grass: 0x9bc77a, leaf: 0x5d9c57, trunk: 0x6b4631, wall: 0xfff6e1, roof: 0xd9704a, cloud: 0xffffff, window: 0xffb15c}
} as const

const CAMERA_FOV = 45
const ORBIT_START_ANGLE = -0.4
const ORBIT_SWEEP = Math.PI * 1.5 // radians travelled across the /about journey
const ORBIT_RADIUS_START = 9.5
const ORBIT_RADIUS_END = 7.5
const ORBIT_HEIGHT_START = 2.6
const ORBIT_HEIGHT_END = 5
const BOB_AMPLITUDE = 0.15
const BOB_SPEED = 0.8
const ISLAND_SPIN = 0.06
const CLOUD_SPEED = 0.4
const CLOUD_WRAP_X = 9
const TREE_SPOTS: ReadonlyArray<readonly [number, number]> = [
  [1.6, 0.8],
  [-1.4, 1.2],
  [0.4, -1.8],
  [-1.9, -0.6],
  [2.1, -1.3]
]
const CLOUD_SPOTS: ReadonlyArray<readonly [number, number, number]> = [
  [-6, 3.2, -3],
  [-2, 4.1, -6],
  [3, 3.6, -4],
  [6.5, 4.4, -7]
]

/** Three-band toon ramp; shared by every material in the scene. */
function toonRamp(): THREE.DataTexture {
  const texture = new THREE.DataTexture(new Uint8Array([90, 160, 230, 255]), 4, 1, THREE.RedFormat)
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  texture.needsUpdate = true
  return texture
}

/** Faceted (low-poly) normals: un-index the geometry so each face shades flat. */
function faceted(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  const flat = geometry.toNonIndexed()
  flat.computeVertexNormals()
  geometry.dispose()
  return flat
}

export const createCartoonScene: SceneFactory = ({isDark, aspect}) => {
  const colors = isDark ? PALETTE.dark : PALETTE.light
  const gradientMap = toonRamp()
  const toon = (color: number) => new THREE.MeshToonMaterial({color, gradientMap})
  const mesh = (geometry: THREE.BufferGeometry, color: number) => new THREE.Mesh(faceted(geometry), toon(color))

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(colors.sky)
  scene.fog = new THREE.Fog(colors.sky, 14, 30)

  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, aspect, 0.1, 100)

  scene.add(new THREE.HemisphereLight(colors.sky, colors.ground, isDark ? 0.5 : 1.1))
  const sun = new THREE.DirectionalLight(0xffffff, isDark ? 0.5 : 1.4)
  sun.position.set(5, 8, 3)
  scene.add(sun)

  const island = new THREE.Group()
  const rock = mesh(new THREE.CylinderGeometry(3, 0.6, 2.4, 8), colors.ground)
  rock.position.y = -1.3
  const grass = mesh(new THREE.CylinderGeometry(3.05, 3.05, 0.3, 8), colors.grass)
  island.add(rock, grass)

  TREE_SPOTS.forEach(([x, z]) => {
    const trunk = mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.5, 5), colors.trunk)
    trunk.position.set(x, 0.4, z)
    const crown = mesh(new THREE.ConeGeometry(0.5, 1.2, 6), colors.leaf)
    crown.position.set(x, 1.2, z)
    island.add(trunk, crown)
  })

  const walls = mesh(new THREE.BoxGeometry(1, 0.8, 1), colors.wall)
  walls.position.set(-0.2, 0.55, 0.1)
  const roof = mesh(new THREE.ConeGeometry(0.9, 0.6, 4), colors.roof)
  roof.position.set(-0.2, 1.25, 0.1)
  roof.rotation.y = Math.PI / 4
  island.add(walls, roof)

  // A warm window at night — the one "lived-in" cue.
  const windowLight = new THREE.PointLight(colors.window, isDark ? 2.5 : 0, 6, 2)
  windowLight.position.set(-0.2, 0.6, 0.8)
  island.add(windowLight)
  scene.add(island)

  const clouds = CLOUD_SPOTS.map(([x, y, z]) => {
    const cloud = new THREE.Group()
    const puffs = [
      [0, 0, 0, 0.55],
      [0.6, 0.1, 0.1, 0.42],
      [-0.55, -0.05, 0.05, 0.4]
    ] as const
    puffs.forEach(([px, py, pz, r]) => {
      const puff = mesh(new THREE.SphereGeometry(r, 8, 6), colors.cloud)
      puff.position.set(px, py, pz)
      cloud.add(puff)
    })
    cloud.position.set(x, y, z)
    scene.add(cloud)
    return cloud
  })

  const lookAt = new THREE.Vector3(0, 0.3, 0)

  return {
    scene,
    camera,
    update(dt, elapsed, progress, pointer) {
      island.position.y = Math.sin(elapsed * BOB_SPEED) * BOB_AMPLITUDE
      island.rotation.y += dt * ISLAND_SPIN

      clouds.forEach((cloud) => {
        cloud.position.x += dt * CLOUD_SPEED
        if (cloud.position.x > CLOUD_WRAP_X) cloud.position.x = -CLOUD_WRAP_X
      })

      const angle = ORBIT_START_ANGLE + progress * ORBIT_SWEEP
      const radius = ORBIT_RADIUS_START + (ORBIT_RADIUS_END - ORBIT_RADIUS_START) * progress
      const height = ORBIT_HEIGHT_START + (ORBIT_HEIGHT_END - ORBIT_HEIGHT_START) * progress
      camera.position.set(
        Math.sin(angle) * radius + pointer.x * 0.5,
        height - pointer.y * 0.3,
        Math.cos(angle) * radius
      )
      camera.lookAt(lookAt)
    }
  }
}
