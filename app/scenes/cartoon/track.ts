import * as THREE from 'three'
import type {Kit} from './kit'

// A winding closed loop over the island (island spans x −20..20, z −16..16).
// Two points per corner keep the bends gentle enough for a straight platform
// on the inside; test/scenes.spec.ts fails if a station touches the rails.
const CONTROL: ReadonlyArray<readonly [number, number]> = [
  [-16.5, 2], [-15.5, 9], [-10, 12.5], [-1, 12.5], [8, 12.5], [14.5, 10.5], [16.5, 3],
  [14, -3], [14.5, -9.5], [9, -12.5], [2, -11], [-6, -12.5], [-13, -11.5], [-17, -5]
]

export const RAIL_HEIGHT = 0.12
const GAUGE = 0.36
const RAIL_RADIUS = 0.045
const SLEEPER_SPACING = 0.55
const BALLAST_HALF_WIDTH = 0.75
const SAMPLES = 600

export interface Track {
  curve: THREE.CatmullRomCurve3
  length: number
  /** Evenly spaced points along the loop, for keeping props off the line. */
  samples: THREE.Vector3[]
  group: THREE.Group
}

export function trackCurve(): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(CONTROL.map(([x, z]) => new THREE.Vector3(x, RAIL_HEIGHT, z)), true, 'catmullrom', 0.5)
}

/** Unit vector in the ground plane, perpendicular to the track at u. */
export function sideAt(curve: THREE.Curve<THREE.Vector3>, u: number, target = new THREE.Vector3()): THREE.Vector3 {
  const t = curve.getTangentAt(u)
  return target.set(-t.z, 0, t.x).normalize()
}

function rail(curve: THREE.CatmullRomCurve3, offset: number, material: THREE.Material): THREE.Mesh {
  const side = new THREE.Vector3()
  const points = Array.from({length: SAMPLES}, (_, i) => {
    const u = i / SAMPLES
    return curve.getPointAt(u).addScaledVector(sideAt(curve, u, side), offset).setY(RAIL_HEIGHT + 0.06)
  })
  return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, true), SAMPLES, RAIL_RADIUS, 4, true), material)
}

function sleepers(kit: Kit, curve: THREE.CatmullRomCurve3, length: number): THREE.InstancedMesh {
  const count = Math.floor(length / SLEEPER_SPACING)
  // Long axis on x; rotating local +z onto the tangent lays each sleeper across the track.
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1.05, 0.07, 0.22), kit.material(kit.colors.sleeper), count)
  const matrix = new THREE.Matrix4()
  const rotation = new THREE.Quaternion()
  const up = new THREE.Vector3(0, 1, 0)
  const scale = new THREE.Vector3(1, 1, 1)
  for (let i = 0; i < count; i++) {
    const u = i / count
    const t = curve.getTangentAt(u)
    rotation.setFromAxisAngle(up, Math.atan2(t.x, t.z))
    matrix.compose(curve.getPointAt(u).setY(RAIL_HEIGHT), rotation, scale)
    mesh.setMatrixAt(i, matrix)
  }
  return mesh
}

/** A flat gravel strip under the sleepers. */
function ballast(kit: Kit, curve: THREE.CatmullRomCurve3): THREE.Mesh {
  const positions: number[] = []
  const indices: number[] = []
  const side = new THREE.Vector3()
  for (let i = 0; i <= SAMPLES; i++) {
    const u = (i % SAMPLES) / SAMPLES
    const p = curve.getPointAt(u)
    sideAt(curve, u, side)
    positions.push(p.x + side.x * BALLAST_HALF_WIDTH, 0.03, p.z + side.z * BALLAST_HALF_WIDTH)
    positions.push(p.x - side.x * BALLAST_HALF_WIDTH, 0.03, p.z - side.z * BALLAST_HALF_WIDTH)
  }
  for (let i = 0; i < SAMPLES; i++) {
    const a = i * 2
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return new THREE.Mesh(geometry, kit.material(kit.colors.ballast, THREE.DoubleSide))
}

export function buildTrack(kit: Kit): Track {
  const curve = trackCurve()
  const length = curve.getLength()
  const group = new THREE.Group()
  group.name = 'track'
  const railMaterial = kit.material(kit.colors.rail)
  group.add(ballast(kit, curve), sleepers(kit, curve, length), rail(curve, -GAUGE, railMaterial), rail(curve, GAUGE, railMaterial))
  return {curve, length, samples: curve.getSpacedPoints(SAMPLES), group}
}
