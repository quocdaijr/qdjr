import * as THREE from 'three'
import type {Vehicle} from '~/data/trips'
import type {Kit} from '../cartoon/kit'

// Toy vehicles for the trip road, in the cartoon kit's toon materials. Each
// model faces +x with its origin on the ground at its centre.

const WHEEL = {small: 0.2, big: 0.24}
const HELMET = 0x2f6e9a

export interface TripVehicle {
  group: THREE.Group
  /** Drive the model to `position`, facing `heading` (radians about y) and tilted `pitch` up or down the slope. */
  place(position: THREE.Vector3, heading: number, pitch: number, speed: number, dt: number): void
}

type Part = [THREE.BufferGeometry, THREE.Material, [number, number, number]]

function assemble(kit: Kit, name: string, parts: Part[]): THREE.Group {
  const g = new THREE.Group()
  g.name = name
  for (const [geometry, material, at] of parts) {
    const mesh = kit.mesh(geometry, material)
    mesh.position.set(...at)
    g.add(mesh)
  }
  return g
}

function wheels(kit: Kit, radius: number, xs: number[], zs: number[]): THREE.Mesh[] {
  return xs.flatMap((x) =>
    zs.map((z) => {
      const wheel = kit.mesh(new THREE.CylinderGeometry(radius, radius, 0.12, 10), kit.material(kit.colors.metal))
      wheel.rotation.x = Math.PI / 2
      wheel.position.set(x, radius, z)
      wheel.userData.wheel = true
      return wheel
    })
  )
}

function motorbike(kit: Kit): THREE.Group {
  const {accent, trainDark, wall, roof} = kit.colors
  const g = assemble(kit, 'vehicle-motorbike', [
    [new THREE.BoxGeometry(0.95, 0.22, 0.2), kit.material(accent), [0, 0.42, 0]],
    [new THREE.BoxGeometry(0.45, 0.1, 0.24), kit.material(trainDark), [-0.12, 0.56, 0]],
    [new THREE.BoxGeometry(0.06, 0.32, 0.5), kit.material(trainDark), [0.42, 0.66, 0]],
    [new THREE.SphereGeometry(0.07, 6, 4), kit.glowMaterial(), [0.52, 0.55, 0]],
    // The rider: legs, a shirt, a round helmet.
    [new THREE.BoxGeometry(0.34, 0.16, 0.3), kit.material(wall), [-0.05, 0.68, 0]],
    [new THREE.BoxGeometry(0.24, 0.42, 0.32), kit.material(roof), [-0.1, 0.95, 0]],
    [new THREE.SphereGeometry(0.17, 8, 6), kit.material(HELMET), [-0.04, 1.3, 0]]
  ])
  g.add(...wheels(kit, WHEEL.small, [-0.4, 0.4], [0]))
  return g
}

function car(kit: Kit): THREE.Group {
  const {water, wall} = kit.colors
  const g = assemble(kit, 'vehicle-car', [
    [new THREE.BoxGeometry(1.5, 0.42, 0.8), kit.material(water), [0, 0.42, 0]],
    [new THREE.BoxGeometry(0.82, 0.36, 0.72), kit.material(wall), [-0.1, 0.81, 0]],
    [new THREE.BoxGeometry(0.84, 0.22, 0.74), kit.windowMaterial(), [-0.1, 0.83, 0]],
    [new THREE.SphereGeometry(0.06, 6, 4), kit.glowMaterial(), [0.76, 0.48, 0.26]],
    [new THREE.SphereGeometry(0.06, 6, 4), kit.glowMaterial(), [0.76, 0.48, -0.26]]
  ])
  g.add(...wheels(kit, WHEEL.small, [-0.48, 0.48], [-0.4, 0.4]))
  return g
}

function coach(kit: Kit): THREE.Group {
  const {wall, accent, roof} = kit.colors
  const g = assemble(kit, 'vehicle-coach', [
    [new THREE.BoxGeometry(2.6, 0.95, 0.9), kit.material(wall), [0, 0.8, 0]],
    [new THREE.BoxGeometry(2.62, 0.16, 0.92), kit.material(accent), [0, 0.5, 0]],
    [new THREE.BoxGeometry(2.3, 0.3, 0.92), kit.windowMaterial(), [-0.1, 0.98, 0]],
    [new THREE.BoxGeometry(0.06, 0.5, 0.8), kit.windowMaterial(), [1.31, 0.95, 0]],
    [new THREE.BoxGeometry(2.4, 0.08, 0.8), kit.material(roof), [0, 1.31, 0]],
    [new THREE.SphereGeometry(0.07, 6, 4), kit.glowMaterial(), [1.31, 0.5, 0.3]],
    [new THREE.SphereGeometry(0.07, 6, 4), kit.glowMaterial(), [1.31, 0.5, -0.3]]
  ])
  g.add(...wheels(kit, WHEEL.big, [-0.85, 0.85], [-0.45, 0.45]))
  return g
}

const BUILD: Record<Vehicle, (kit: Kit) => THREE.Group> = {motorbike, car, coach}

/** The one vehicle the whole trip is driven with. */
export function buildVehicle(kit: Kit, kind: Vehicle): TripVehicle {
  const model = BUILD[kind](kit)
  model.rotation.order = 'YZX' // heading first, then the pitch about the model's own axis
  const group = new THREE.Group()
  group.name = 'vehicle'
  group.add(model)
  let wheelAngle = 0

  return {
    group,
    place(position, heading, pitch, speed, dt) {
      wheelAngle -= (speed * dt) / WHEEL.small
      model.position.copy(position)
      model.rotation.y = heading
      model.rotation.z = pitch
      model.traverse((o) => {
        if (o.userData.wheel) o.rotation.y = wheelAngle
      })
    }
  }
}
