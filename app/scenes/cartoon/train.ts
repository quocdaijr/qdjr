import * as THREE from 'three'
import type {Kit} from './kit'
import {wrapU} from './motion'
import {RAIL_HEIGHT} from './track'

// Models face +x with the origin on the rail centre line.
const CAR_SPACING = 1.75 // world units between car centres
const WHEEL_RADIUS = 0.22
const SMOKE_PUFFS = 8
const SMOKE_LIFE = 1.6 // seconds
const SMOKE_RISE = 0.9 // units/s
const CHIMNEY = new THREE.Vector3(0.65, 1.5, 0)

export interface Train {
  group: THREE.Group
  /** Place the train at u, moving at `speed` units/s (signed). */
  place(curve: THREE.CatmullRomCurve3, length: number, u: number, speed: number, dt: number): void
}

function wheels(kit: Kit, xs: number[]): THREE.Mesh[] {
  return xs.flatMap((x) =>
    [-0.4, 0.4].map((z) => {
      const wheel = kit.mesh(new THREE.CylinderGeometry(WHEEL_RADIUS, WHEEL_RADIUS, 0.08, 10), kit.material(kit.colors.metal))
      wheel.rotation.x = Math.PI / 2
      wheel.position.set(x, WHEEL_RADIUS + 0.03, z)
      wheel.userData.wheel = true
      return wheel
    })
  )
}

function part(kit: Kit, geometry: THREE.BufferGeometry, material: THREE.Material, at: [number, number, number]): THREE.Mesh {
  const mesh = kit.mesh(geometry, material)
  mesh.position.set(...at)
  return mesh
}

function locomotive(kit: Kit): THREE.Group {
  const {train, trainDark} = kit.colors
  const boiler = part(kit, new THREE.CylinderGeometry(0.33, 0.33, 1.2, 10), kit.material(train), [0.25, 0.72, 0])
  boiler.rotation.z = Math.PI / 2
  const catcher = part(kit, new THREE.ConeGeometry(0.32, 0.35, 4), kit.material(trainDark), [1.08, 0.28, 0])
  catcher.rotation.z = -Math.PI / 2
  const loco = new THREE.Group()
  loco.name = 'train-loco'
  loco.add(
    part(kit, new THREE.BoxGeometry(2, 0.2, 0.75), kit.material(trainDark), [0, 0.32, 0]),
    boiler,
    part(kit, new THREE.BoxGeometry(0.7, 0.9, 0.8), kit.material(train), [-0.55, 0.87, 0]),
    part(kit, new THREE.BoxGeometry(0.85, 0.1, 0.95), kit.material(trainDark), [-0.55, 1.37, 0]),
    part(kit, new THREE.CylinderGeometry(0.12, 0.16, 0.45, 8), kit.material(trainDark), [0.65, 1.2, 0]),
    part(kit, new THREE.SphereGeometry(0.09, 6, 4), kit.glowMaterial(), [0.9, 0.85, 0]),
    catcher,
    ...wheels(kit, [-0.6, 0, 0.6])
  )
  if (kit.isDark) {
    const headlight = new THREE.PointLight(kit.colors.glow, 3, 8, 2)
    headlight.position.set(1.4, 0.9, 0)
    loco.add(headlight)
  }
  return loco
}

function wagon(kit: Kit, body: number): THREE.Group {
  const {trainDark, roof} = kit.colors
  const g = new THREE.Group()
  g.add(
    part(kit, new THREE.BoxGeometry(1.5, 0.2, 0.75), kit.material(trainDark), [0, 0.32, 0]),
    part(kit, new THREE.BoxGeometry(1.4, 0.65, 0.8), kit.material(body), [0, 0.72, 0]),
    part(kit, new THREE.BoxGeometry(1.55, 0.1, 0.9), kit.material(roof), [0, 1.1, 0]),
    ...wheels(kit, [-0.45, 0.45])
  )
  return g
}

function smoke(kit: Kit): THREE.Mesh[] {
  return Array.from({length: SMOKE_PUFFS}, (_, i) => {
    const material = new THREE.MeshToonMaterial({color: kit.colors.cloud, transparent: true, opacity: 0, depthWrite: false})
    const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0), material)
    puff.userData.life = i / SMOKE_PUFFS
    return puff
  })
}

export function buildTrain(kit: Kit): Train {
  const group = new THREE.Group()
  group.name = 'train'
  const cars = [locomotive(kit), wagon(kit, kit.colors.wall), wagon(kit, kit.colors.accent)]
  const puffs = smoke(kit)
  group.add(...cars, ...puffs)

  const chimney = new THREE.Vector3()
  let wheelAngle = 0
  let smokeStarted = false

  return {
    group,
    place(curve, length, u, speed, dt) {
      cars.forEach((car, k) => {
        const uk = wrapU(u - (k * CAR_SPACING) / length)
        const t = curve.getTangentAt(uk)
        car.position.copy(curve.getPointAt(uk)).setY(RAIL_HEIGHT)
        car.rotation.y = Math.atan2(-t.z, t.x)
      })

      wheelAngle -= (speed * dt) / WHEEL_RADIUS
      group.traverse((o) => {
        if (o.userData.wheel) o.rotation.y = wheelAngle
      })

      // Puffs drift up from the chimney; they thin out when the train stands still.
      cars[0].updateMatrixWorld() // localToWorld reads matrixWorld, stale until the next render
      cars[0].localToWorld(chimney.copy(CHIMNEY))
      if (!smokeStarted) {
        puffs.forEach((puff) => puff.position.copy(chimney))
        smokeStarted = true
      }
      const activity = Math.min(1, 0.25 + Math.abs(speed) / 4)
      for (const puff of puffs) {
        let life = puff.userData.life + dt / SMOKE_LIFE
        if (life >= 1) {
          life -= 1
          puff.position.copy(chimney)
        }
        puff.userData.life = life
        puff.position.y += SMOKE_RISE * dt
        puff.scale.setScalar(0.5 + life * 1.6)
        ;(puff.material as THREE.MeshToonMaterial).opacity = (1 - life) * 0.7 * activity
      }
    }
  }
}
