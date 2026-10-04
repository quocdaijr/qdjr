import * as THREE from 'three'
import {mulberry32} from '../random'
import {createWind, type Wind} from './wind'

// Hex because THREE.Color cannot parse oklch(). The Ghibli register: a
// painted blue sky over warm haze, lush meadow greens, cream walls and
// red-brown roofs by day; a deep blue summer night with fireflies.
export interface Colors {
  /** Fog and horizon haze (the sky dome blends from here up to skyTop). */
  sky: number
  skyTop: number
  horizon: number
  sunlight: number
  petal: number
  firefly: number
  ground: number
  cliff: number
  grass: number
  leaf: number
  leafDark: number
  trunk: number
  wall: number
  roof: number
  accent: number
  rail: number
  sleeper: number
  ballast: number
  platform: number
  water: number
  cloud: number
  stone: number
  window: number
  glow: number
  train: number
  trainDark: number
  metal: number
  /** Rice paddies on the trip board. */
  paddy: number
  flowers: readonly number[]
}

export const PALETTE: Readonly<Record<'light' | 'dark', Colors>> = {
  light: {
    sky: 0xf3ead3, skyTop: 0x7fb8e6, horizon: 0xf3ead3, sunlight: 0xfff0d2, petal: 0xf7c6cf, firefly: 0xf6f08a,
    ground: 0x8d5e43, cliff: 0x6f4a35, grass: 0x86bf4f, leaf: 0x4f9a3f, leafDark: 0x2f6e3c,
    trunk: 0x6b4631, wall: 0xfbf3e0, roof: 0xb8533b, accent: 0xca4e36, rail: 0x5a5f66, sleeper: 0x7a5236,
    ballast: 0xc9bca4, platform: 0xd9c9a8, water: 0x6fb7d6, cloud: 0xffffff, stone: 0xb9b2a5, window: 0x3d4a5c,
    glow: 0xffc36b, train: 0xca4e36, trainDark: 0x3f2a1f, metal: 0x4a4f57, paddy: 0xc3d96a,
    flowers: [0xef704c, 0xf2c14e, 0xffffff, 0xc8453a, 0x9b7fd6]
  },
  dark: {
    sky: 0x3c4777, skyTop: 0x141c46, horizon: 0x3c4777, sunlight: 0x9fb2ff, petal: 0xf7c6cf, firefly: 0xf6f08a,
    ground: 0x4a3426, cliff: 0x3a2a20, grass: 0x557f45, leaf: 0x3d6b45, leafDark: 0x2a4d36,
    trunk: 0x5a3b2a, wall: 0xe9d9b8, roof: 0xb9583a, accent: 0xca4e36, rail: 0x6c7178, sleeper: 0x5e3f2a,
    ballast: 0x8f8470, platform: 0xa8977a, water: 0x2f4f7a, cloud: 0x8f96bf, stone: 0x8c857a, window: 0xffb15c,
    glow: 0xffc36b, train: 0xb9472f, trainDark: 0x2b1c14, metal: 0x3a3e45, paddy: 0x7e8f45,
    flowers: [0xc9604a, 0xc9a24a, 0xd9cfc4, 0xa83a30, 0x7d68ad]
  }
}

const SEED = 20261002

/** Three-band toon ramp shared by every material in the scene. */
function toonRamp(): THREE.DataTexture {
  const texture = new THREE.DataTexture(new Uint8Array([90, 160, 230, 255]), 4, 1, THREE.RedFormat)
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  texture.needsUpdate = true
  return texture
}

/** Faceted (low-poly) normals: un-index the geometry so each face shades flat. */
export function faceted(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  if (!geometry.index) {
    geometry.computeVertexNormals()
    return geometry
  }
  const flat = geometry.toNonIndexed()
  flat.computeVertexNormals()
  geometry.dispose()
  return flat
}

export interface Kit {
  colors: Colors
  isDark: boolean
  material(color: number, side?: THREE.Side): THREE.MeshToonMaterial
  /** Toon material coloured per vertex (the trip terrain). */
  vertexColorMaterial(): THREE.MeshToonMaterial
  windowMaterial(): THREE.MeshToonMaterial
  glowMaterial(): THREE.MeshToonMaterial
  /** Foliage material that bends in the shared wind between y = base and base + height. */
  swayMaterial(color: number, base: number, height: number): THREE.MeshToonMaterial
  mesh(geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Mesh
  random(): number
  wind: Wind
}

export function createKit(isDark: boolean): Kit {
  const colors = isDark ? PALETTE.dark : PALETTE.light
  const gradientMap = toonRamp()
  const wind = createWind()
  const cache = new Map<string, THREE.MeshToonMaterial>()
  const cached = (key: string, make: () => THREE.MeshToonMaterial) => {
    const hit = cache.get(key)
    if (hit) return hit
    const made = make()
    cache.set(key, made)
    return made
  }
  // Night: windows and lamps glow; day: they are plain surfaces.
  const lit = (color: number, intensity: number) =>
    new THREE.MeshToonMaterial({color, gradientMap, emissive: isDark ? colors.glow : 0x000000, emissiveIntensity: isDark ? intensity : 0})

  return {
    colors,
    isDark,
    material: (color, side = THREE.FrontSide) => cached(`${color}:${side}`, () => new THREE.MeshToonMaterial({color, gradientMap, side})),
    vertexColorMaterial: () => cached('vertex', () => new THREE.MeshToonMaterial({vertexColors: true, gradientMap})),
    windowMaterial: () => cached('window', () => lit(colors.window, 1.1)),
    glowMaterial: () => cached('glow', () => lit(colors.glow, 2)),
    swayMaterial: (color, base, height) =>
      cached(`sway:${color}:${base}:${height}`, () => wind.patch(new THREE.MeshToonMaterial({color, gradientMap}), base, height)),
    mesh: (geometry, material) => new THREE.Mesh(faceted(geometry), material),
    random: mulberry32(SEED),
    wind
  }
}
