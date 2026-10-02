import * as THREE from 'three'
import type {Kit} from './kit'

// Ghibli cumulus: flat-bottomed heaps of soft puffs. Towering ones stand far
// behind the island as a backdrop; small ones drift over it. One instanced
// mesh for every puff, so the sky costs a single draw call.
interface ClusterSpec {
  x: number
  y: number
  z: number
  size: number
  puffs: number
}

const CLUSTERS: Readonly<Record<'high' | 'low', readonly ClusterSpec[]>> = {
  high: [
    {x: -46, y: 12, z: -62, size: 7, puffs: 14},
    {x: -14, y: 15, z: -70, size: 9, puffs: 14},
    {x: 22, y: 13, z: -66, size: 8, puffs: 14},
    {x: 52, y: 11, z: -58, size: 6, puffs: 12},
    {x: 70, y: 9, z: -20, size: 6, puffs: 10},
    {x: -20, y: 11, z: -6, size: 2.2, puffs: 8},
    {x: 6, y: 13, z: 10, size: 1.8, puffs: 8},
    {x: 20, y: 12, z: -10, size: 2, puffs: 8},
    {x: -4, y: 14, z: -18, size: 2.4, puffs: 8}
  ],
  low: [
    {x: -30, y: 13, z: -66, size: 8, puffs: 10},
    {x: 18, y: 13, z: -66, size: 8, puffs: 10},
    {x: -12, y: 12, z: -4, size: 2.2, puffs: 6},
    {x: 14, y: 13, z: 6, size: 2, puffs: 6}
  ]
}

const DRIFT_SPEED = 0.5 // units per second, scaled down for the big far clouds
const WRAP = 90

export interface Clouds {
  mesh: THREE.InstancedMesh
  update(dt: number): void
}

export function buildClouds(kit: Kit, detail: 'high' | 'low'): Clouds {
  const specs = CLUSTERS[detail]
  const total = specs.reduce((n, c) => n + c.puffs, 0)
  // A soft self-glow keeps them white and fluffy instead of grey on their shaded side.
  const material = new THREE.MeshLambertMaterial({color: kit.colors.cloud, emissive: kit.colors.cloud, emissiveIntensity: kit.isDark ? 0.25 : 0.55})
  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 10), material, total)
  mesh.name = 'cloud-puffs'
  mesh.frustumCulled = false // instances spread far beyond the base sphere's bounds

  // Each puff's offset from its cluster centre and its scale, fixed at build time.
  const puffs = specs.flatMap((c, ci) =>
    Array.from({length: c.puffs}, (_, k) => {
      const spread = (k / c.puffs) * 2 - 1 // left to right through the heap
      const r = c.size * (0.45 + kit.random() * 0.4) * (1 - Math.abs(spread) * 0.45)
      return {
        cluster: ci,
        offset: new THREE.Vector3(spread * c.size * 1.6, r * 0.55 + kit.random() * c.size * 0.35, (kit.random() - 0.5) * c.size),
        scale: new THREE.Vector3(r, r * 0.82, r)
      }
    })
  )
  const shift = specs.map(() => 0)
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const at = new THREE.Vector3()

  const write = () => {
    puffs.forEach((p, i) => {
      const c = specs[p.cluster]
      at.set(c.x + shift[p.cluster], c.y, c.z).add(p.offset)
      mesh.setMatrixAt(i, m.compose(at, q, p.scale))
    })
    mesh.instanceMatrix.needsUpdate = true
  }
  write()

  return {
    mesh,
    update(dt) {
      if (dt === 0) return
      specs.forEach((c, i) => {
        // Far clouds move slower, which reads as depth.
        shift[i] += (dt * DRIFT_SPEED * 3) / (c.size + 2)
        if (c.x + shift[i] > WRAP) shift[i] -= WRAP * 2
      })
      write()
    }
  }
}
