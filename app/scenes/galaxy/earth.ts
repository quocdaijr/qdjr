import * as THREE from 'three'
import {monoLabel} from '../labels'
import {panelMaterial, surfaceMaterial} from './paint'

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

// Spacecraft in the illustrated-satellite style: white hulls, gold foil,
// gridded blue solar panels, dishes. One panel material is shared by all craft.
const MOON_NIGHT = 0.2
const EMBERS = [
  {size: 0.95, color: 0xffb347, opacity: 0.75},
  {size: 0.75, color: 0xff8a2a, opacity: 0.6},
  {size: 0.55, color: 0xf2581e, opacity: 0.45},
  {size: 0.38, color: 0xd93a14, opacity: 0.3},
  {size: 0.22, color: 0xb0260e, opacity: 0.18}
] as const
let sharedPanel: THREE.ShaderMaterial | null = null
const panelSurface = () => (sharedPanel ??= panelMaterial())
// A little self-light: the camera often sees a craft's night side.
const hull = () => new THREE.MeshStandardMaterial({color: 0xeceef2, metalness: 0.2, roughness: 0.45, emissive: 0xeceef2, emissiveIntensity: 0.25})
const foil = () => new THREE.MeshStandardMaterial({color: 0xd9a63f, metalness: 0.6, roughness: 0.35, emissive: 0xd9a63f, emissiveIntensity: 0.3})

function panel(w: number, h: number): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), panelSurface())
  mesh.name = 'solar-panel'
  return mesh
}

function dish(r: number): THREE.Mesh {
  // A shallow bowl: the cap of a sphere, opening towards +y.
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 8, 0, Math.PI * 2, 0, Math.PI / 3.2), new THREE.MeshStandardMaterial({color: 0xf4f4f6, roughness: 0.5, side: THREE.DoubleSide}))
  mesh.rotation.x = Math.PI
  mesh.name = 'dish'
  return mesh
}

function moon(r: number): THREE.Object3D {
  return new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), surfaceMaterial({kind: 'rocky', colors: [0xc9c5bd, 0x9d988f, 0x77726b, 0xe2ded6], seed: 9.1}, MOON_NIGHT))
}

/** Communication satellite: hull, a long boom of panels each side, a dish. */
function satellite(r: number): THREE.Object3D {
  const g = new THREE.Group()
  g.add(new THREE.Mesh(new THREE.BoxGeometry(r * 0.8, r * 0.8, r * 0.8), foil()))
  const boom = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.04, r * 0.04, r * 4.2, 6), hull())
  boom.rotation.z = Math.PI / 2
  g.add(boom)
  for (const side of [-1, 1]) {
    const wing = panel(r * 1.6, r * 0.7)
    wing.position.x = side * r * 1.45
    g.add(wing)
  }
  const d = dish(r * 0.45)
  d.position.y = r * 0.55
  g.add(d)
  return g
}

/** Space station: a central module, a long truss, four panel wings. */
function station(r: number): THREE.Object3D {
  const g = new THREE.Group()
  const module = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.28, r * 0.28, r * 1.4, 12), hull())
  module.rotation.x = Math.PI / 2
  g.add(module)
  const truss = new THREE.Mesh(new THREE.BoxGeometry(r * 3.2, r * 0.1, r * 0.1), foil())
  g.add(truss)
  for (const x of [-1.25, 1.25]) {
    for (const z of [-0.45, 0.45]) {
      const wing = panel(r * 0.7, r * 0.75)
      wing.rotation.x = -Math.PI / 2
      wing.position.set(x * r, 0, z * r)
      g.add(wing)
    }
  }
  return g
}

/** Meteor: cratered rock trailing a line of fading embers (reads right from any angle). */
function meteor(r: number): THREE.Object3D {
  const g = new THREE.Group()
  g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), surfaceMaterial({kind: 'rocky', colors: [0x7a5a44, 0x5a3f2e, 0x3e2a1f, 0x9a7558], seed: 2.6}, MOON_NIGHT)))
  const tail = new THREE.Group()
  tail.name = 'meteor-tail'
  EMBERS.forEach((ember, i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r * ember.size, 12, 8), new THREE.MeshBasicMaterial({color: ember.color, transparent: true, opacity: ember.opacity, depthWrite: false}))
    m.position.z = -r * (0.75 + i * 0.7) // trails behind along -z (its orbit runs +z locally)
    tail.add(m)
  })
  g.add(tail)
  return g
}

/** Deep-space probe: a foil bus, a big dish, a sensor boom. */
function probe(r: number): THREE.Object3D {
  const g = new THREE.Group()
  g.add(new THREE.Mesh(new THREE.BoxGeometry(r * 0.7, r * 0.5, r * 0.7), foil()))
  const d = dish(r * 0.85)
  d.position.y = r * 0.6
  g.add(d)
  const boom = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.03, r * 0.03, r * 2, 5), hull())
  boom.rotation.z = Math.PI / 2.6
  boom.position.x = r * 0.9
  g.add(boom)
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
