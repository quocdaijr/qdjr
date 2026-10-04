import * as THREE from 'three'
import type {Kit} from './kit'
import {COTTAGES} from './layout'

// Cottages round the lake, each with a chimney breathing a slow column of
// smoke: puffs rise, swell and thin out (by shrinking, so one instanced mesh
// carries them all).

const PUFFS = 6 // per chimney
const SMOKE = {life: 3.2, rise: 0.55, drift: 0.18, size: 0.16, grow: 0.5}
const CHIMNEY = new THREE.Vector3(0.32, 1.55, -0.18)

export interface Village {
  group: THREE.Group
  update(dt: number): void
}

function cottage(kit: Kit, i: number): THREE.Group {
  const walls = i % 2 ? kit.colors.wall : kit.colors.platform
  const body = kit.mesh(new THREE.BoxGeometry(1.2, 0.8, 0.95), kit.material(walls))
  body.position.y = 0.4
  const roof = kit.mesh(new THREE.ConeGeometry(0.92, 0.65, 4), kit.material(i % 2 ? kit.colors.roof : kit.colors.accent))
  roof.rotation.y = Math.PI / 4
  roof.position.y = 1.12
  const chimney = kit.mesh(new THREE.BoxGeometry(0.2, 0.5, 0.2), kit.material(kit.colors.stone))
  chimney.position.set(CHIMNEY.x, 1.25, CHIMNEY.z)
  const door = kit.mesh(new THREE.BoxGeometry(0.26, 0.42, 0.04), kit.material(kit.colors.trunk))
  door.position.set(0, 0.21, 0.48)
  const pane = kit.mesh(new THREE.BoxGeometry(0.24, 0.22, 0.04), kit.windowMaterial())
  pane.position.set(0.36, 0.48, 0.48)
  const g = new THREE.Group()
  g.add(body, roof, chimney, door, pane)
  g.name = `cottage-${i}`
  return g
}

export function buildVillage(kit: Kit): Village {
  const group = new THREE.Group()
  group.name = 'village'
  const chimneys = COTTAGES.map((c, i) => {
    const house = cottage(kit, i)
    house.position.set(c.x, 0, c.z)
    house.rotation.y = c.turn
    group.add(house)
    house.updateMatrixWorld()
    return house.localToWorld(CHIMNEY.clone())
  })
  const smoke = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshLambertMaterial({color: kit.colors.cloud, emissive: kit.colors.cloud, emissiveIntensity: kit.isDark ? 0.15 : 0.4}), chimneys.length * PUFFS)
  smoke.name = 'chimney-smoke'
  group.add(smoke)
  const life = Array.from({length: chimneys.length * PUFFS}, (_, k) => (k % PUFFS) / PUFFS)
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const s = new THREE.Vector3()
  const at = new THREE.Vector3()
  const place = (dt: number) => {
    life.forEach((t, k) => {
      const next = (t + dt / SMOKE.life) % 1
      life[k] = next
      const base = chimneys[Math.floor(k / PUFFS)]!
      // Swell, then shrink away near the top of the column.
      const size = SMOKE.size * (1 + next * SMOKE.grow * 3) * Math.sin(Math.PI * Math.min(1, next * 1.15))
      smoke.setMatrixAt(k, m.compose(at.set(base.x + next * SMOKE.drift, base.y + next * SMOKE.life * SMOKE.rise, base.z), q, s.setScalar(Math.max(0, size))))
    })
    smoke.instanceMatrix.needsUpdate = true
  }
  place(0)
  return {group, update: place}
}
