import * as THREE from 'three'
import {packetAt, type Architecture, type Vec3} from './architecture'

// Request packets: small cubes looping along every wire, plus a short burst
// along the wire the journey just travelled (or along every wire, on demand).
const SIZE = 0.18
const SPEED = 3 // world units per second
const PER_EDGE = {high: 2, low: 1}
const BURST = {count: 5, stagger: 0.12, life: 1.2}

export interface Packets {
  mesh: THREE.InstancedMesh
  update(elapsed: number): void
  /** A burst along edge [from, to] (an index pair of arch.edges). */
  burst(edge: [number, number], elapsed: number): void
  /** A burst along every edge, staggered. */
  flood(elapsed: number): void
}

const length = (a: Vec3, b: Vec3) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2])

export function createPackets(arch: Architecture, color: number, detail: 'high' | 'low'): Packets {
  const steady = arch.edges.flatMap((edge) => Array.from({length: PER_EDGE[detail]}, (_, j) => ({edge, phase: j / PER_EDGE[detail]})))
  const bursts: Array<{edge: [number, number]; start: number}> = []
  const capacity = steady.length + BURST.count * arch.edges.length
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(SIZE, SIZE, SIZE), new THREE.MeshBasicMaterial({color}), capacity)
  mesh.name = 'packets'
  mesh.frustumCulled = false
  mesh.userData.burst = null
  const m = new THREE.Matrix4()
  const hidden = new THREE.Matrix4().makeScale(0, 0, 0)

  const place = (i: number, edge: [number, number], t: number) => {
    const p = packetAt(arch.nodes[edge[0]].position, arch.nodes[edge[1]].position, t)
    mesh.setMatrixAt(i, m.makeTranslation(...p))
  }

  const update = (elapsed: number) => {
    steady.forEach(({edge, phase}, i) => {
      const len = length(arch.nodes[edge[0]].position, arch.nodes[edge[1]].position)
      place(i, edge, ((elapsed * SPEED) / len + phase) % 1)
    })
    for (let i = steady.length; i < capacity; i++) mesh.setMatrixAt(i, hidden)
    let slot = steady.length
    for (const b of bursts) {
      for (let j = 0; j < BURST.count && slot < capacity; j++, slot++) {
        const t = (elapsed - b.start - j * BURST.stagger) / BURST.life
        if (t >= 0 && t <= 1) place(slot, b.edge, t)
      }
    }
    while (bursts.length && elapsed - bursts[0].start > BURST.life + BURST.count * BURST.stagger) bursts.shift()
    mesh.instanceMatrix.needsUpdate = true
  }

  return {
    mesh,
    update,
    burst(edge, elapsed) {
      bursts.push({edge, start: elapsed})
      if (bursts.length > arch.edges.length) bursts.shift()
      mesh.userData.burst = edge
    },
    flood(elapsed) {
      arch.edges.forEach((edge, i) => bursts.push({edge, start: elapsed + i * 0.15}))
      while (bursts.length > arch.edges.length) bursts.shift()
    }
  }
}
