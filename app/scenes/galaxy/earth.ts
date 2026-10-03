import * as THREE from 'three'
import {monoLabel} from '../labels'

// The Projects stop: Earth with one orbiter per project. Kinds cycle so the
// space around Earth reads as varied traffic, not a row of identical dots.
export type OrbiterKind = 'moon' | 'satellite' | 'station' | 'meteor' | 'probe'
const KINDS: readonly OrbiterKind[] = ['moon', 'satellite', 'station', 'meteor', 'probe']
const ORBIT = {inner: 1.25, step: 0.2, speed: 0.35, tilt: 0.5}
const SIZE: Readonly<Record<OrbiterKind, number>> = {moon: 0.16, satellite: 0.12, station: 0.15, meteor: 0.11, probe: 0.1}
const HIT_RADIUS = 0.35 // invisible sphere so tiny orbiters are easy to click
const LABEL_HEIGHT = 0.05

export interface EarthSystem {
  group: THREE.Group
  orbiters: THREE.Object3D[]
  update(dt: number, focus: number | null): void
}

const metal = (color: number) => new THREE.MeshStandardMaterial({color, metalness: 0.6, roughness: 0.4})

function moon(r: number): THREE.Object3D {
  return new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), new THREE.MeshStandardMaterial({color: 0xb9b6ad, roughness: 1}))
}

function satellite(r: number): THREE.Object3D {
  const g = new THREE.Group()
  const panel = new THREE.MeshStandardMaterial({color: 0x3b5bdb, metalness: 0.3, roughness: 0.5, side: THREE.DoubleSide})
  g.add(new THREE.Mesh(new THREE.BoxGeometry(r, r * 0.6, r * 0.6), metal(0xd9d4c7)))
  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.PlaneGeometry(r * 1.6, r * 0.6), panel)
    wing.position.x = side * r * 1.35
    g.add(wing)
  }
  return g
}

function station(r: number): THREE.Object3D {
  const g = new THREE.Group()
  const truss = metal(0xcfd3dc)
  for (const axis of ['x', 'z'] as const) {
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.15, r * 0.15, r * 2.2, 6), truss)
    beam.rotation[axis] = Math.PI / 2
    g.add(beam)
  }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 0.7, r * 0.08, 6, 24), truss)
  ring.rotation.x = Math.PI / 2
  g.add(ring)
  return g
}

function meteor(r: number): THREE.Object3D {
  const g = new THREE.Group()
  g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), new THREE.MeshStandardMaterial({color: 0x8a6f5a, roughness: 1, flatShading: true})))
  const tail = new THREE.Mesh(
    new THREE.ConeGeometry(r * 0.6, r * 3, 8, 1, true),
    new THREE.MeshBasicMaterial({color: 0xffb36b, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false})
  )
  tail.rotation.x = -Math.PI / 2 // trails behind along -z (its orbit runs +z locally)
  tail.position.z = -r * 1.6
  g.add(tail)
  return g
}

function probe(r: number): THREE.Object3D {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.ConeGeometry(r * 0.5, r * 1.2, 8), metal(0xe0c58a))
  const dish = new THREE.Mesh(new THREE.CircleGeometry(r * 0.7, 16), new THREE.MeshStandardMaterial({color: 0xf0eee8, side: THREE.DoubleSide}))
  dish.position.y = r * 0.7
  dish.rotation.x = -Math.PI / 2
  g.add(body, dish)
  return g
}

const BUILD: Readonly<Record<OrbiterKind, (r: number) => THREE.Object3D>> = {moon, satellite, station, meteor, probe}

export function buildEarthSystem(projects: readonly {alt: string}[], labelColor: string, loadAssets: boolean): EarthSystem {
  const group = new THREE.Group()
  group.name = 'earth-system'
  const n = projects.length
  const labels: Array<THREE.Sprite | null> = []
  const pivots = projects.map((p, k) => {
    const kind = KINDS[k % KINDS.length]
    const radius = SIZE[kind]
    const pivot = new THREE.Object3D()
    pivot.rotation.set(ORBIT.tilt * Math.sin(k * 1.7), (k / n) * Math.PI * 2, 0)
    const orbiter = BUILD[kind](radius)
    orbiter.name = `orbiter-${k}`
    orbiter.userData = {kind, radius}
    orbiter.position.x = ORBIT.inner + k * ORBIT.step
    orbiter.add(new THREE.Mesh(new THREE.SphereGeometry(HIT_RADIUS, 8, 6), new THREE.MeshBasicMaterial({visible: false})))
    const label = loadAssets ? monoLabel(p.alt, labelColor, LABEL_HEIGHT) : null
    if (label) {
      label.position.y = radius + LABEL_HEIGHT
      label.visible = false
      orbiter.add(label)
    }
    labels.push(label)
    pivot.add(orbiter)
    group.add(pivot)
    return pivot
  })
  const orbiters = pivots.map((pivot) => pivot.children[0])

  return {
    group,
    orbiters,
    update(dt, focus) {
      pivots.forEach((pivot, k) => {
        // The picked orbiter holds still so the camera can settle on it.
        if (k !== focus) pivot.rotation.y += (dt * ORBIT.speed) / (1 + k * 0.08)
        const label = labels[k]
        if (label) label.visible = k === focus
      })
    }
  }
}
