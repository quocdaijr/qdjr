import * as THREE from 'three'

// Hex because THREE.Color cannot parse oklch(). The warm diorama register:
// cream sky, terracotta, two greens (design.md cartoon + train-diorama).
export interface Colors {
  sky: number
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
  flowers: readonly number[]
}

export const PALETTE: Readonly<Record<'light' | 'dark', Colors>> = {
  light: {
    sky: 0xf6ecd8, ground: 0x8d5e43, cliff: 0x6f4a35, grass: 0x9bc77a, leaf: 0x5d9c57, leafDark: 0x3f7d5a,
    trunk: 0x6b4631, wall: 0xfff6e1, roof: 0xd9704a, accent: 0xca4e36, rail: 0x5a5f66, sleeper: 0x7a5236,
    ballast: 0xc9bca4, platform: 0xd9c9a8, water: 0x6fb3d9, cloud: 0xffffff, stone: 0xb9b2a5, window: 0x3d4a5c,
    glow: 0xffc36b, train: 0xca4e36, trainDark: 0x3f2a1f, metal: 0x4a4f57,
    flowers: [0xef704c, 0xf2c14e, 0xffffff, 0xc8453a, 0x9b7fd6]
  },
  dark: {
    sky: 0x2b2320, ground: 0x5e3f2d, cliff: 0x4a3224, grass: 0x6f9a57, leaf: 0x4f8a4b, leafDark: 0x356a4b,
    trunk: 0x5a3b2a, wall: 0xe9d9b8, roof: 0xb9583a, accent: 0xca4e36, rail: 0x6c7178, sleeper: 0x5e3f2a,
    ballast: 0x8f8470, platform: 0xa8977a, water: 0x2f5d7a, cloud: 0xb9aea3, stone: 0x8c857a, window: 0xffb15c,
    glow: 0xffc36b, train: 0xb9472f, trainDark: 0x2b1c14, metal: 0x3a3e45,
    flowers: [0xc9604a, 0xc9a24a, 0xd9cfc4, 0xa83a30, 0x7d68ad]
  }
}

const SEED = 20261002

/** Small deterministic PRNG so the island looks the same on every visit. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

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
  windowMaterial(): THREE.MeshToonMaterial
  glowMaterial(): THREE.MeshToonMaterial
  mesh(geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Mesh
  random(): number
}

export function createKit(isDark: boolean): Kit {
  const colors = isDark ? PALETTE.dark : PALETTE.light
  const gradientMap = toonRamp()
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
    windowMaterial: () => cached('window', () => lit(colors.window, 1.1)),
    glowMaterial: () => cached('glow', () => lit(colors.glow, 2)),
    mesh: (geometry, material) => new THREE.Mesh(faceted(geometry), material),
    random: mulberry32(SEED)
  }
}
