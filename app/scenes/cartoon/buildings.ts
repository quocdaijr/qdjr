import * as THREE from 'three'
import type {JourneyStation, StationKind} from '~/data/journeyStations'
import type {Kit} from './kit'

// Every builder returns a group whose origin is the ground centre of the
// building and whose front faces +z (stations.ts turns it to face the track).

type Builder = (kit: Kit, station: JourneyStation, loadAssets: boolean) => THREE.Group

function box(kit: Kit, size: [number, number, number], material: THREE.Material, at: [number, number, number]): THREE.Mesh {
  const mesh = kit.mesh(new THREE.BoxGeometry(...size), material)
  mesh.position.set(...at)
  return mesh
}

function post(kit: Kit, height: number, color: number, at: [number, number]): THREE.Mesh {
  const mesh = kit.mesh(new THREE.CylinderGeometry(0.05, 0.05, height, 6), kit.material(color))
  mesh.position.set(at[0], height / 2, at[1])
  return mesh
}

/** Four-sided pyramid roof sized to a w × d footprint, sitting at height y. */
function hipRoof(kit: Kit, w: number, d: number, h: number, color: number, y: number): THREE.Group {
  const cone = kit.mesh(new THREE.ConeGeometry(1, 1, 4), kit.material(color))
  cone.rotation.y = Math.PI / 4
  const roof = new THREE.Group()
  roof.add(cone)
  roof.scale.set(w * 0.78, h, d * 0.78)
  roof.position.y = y + h / 2
  return roof
}

function windowsGrid(kit: Kit, columns: number[], rows: number[], z: number): THREE.Mesh[] {
  return rows.flatMap((y) => columns.map((x) => box(kit, [0.3, 0.34, 0.04], kit.windowMaterial(), [x, y, z])))
}

const home: Builder = (kit) => {
  const {wall, roof, trunk, trainDark} = kit.colors
  const g = new THREE.Group()
  g.add(
    box(kit, [1.6, 1.1, 1.4], kit.material(wall), [0, 0.55, 0]),
    hipRoof(kit, 1.6, 1.4, 0.9, roof, 1.1),
    box(kit, [0.25, 0.6, 0.25], kit.material(trainDark), [0.45, 1.75, -0.25]),
    box(kit, [0.34, 0.6, 0.04], kit.material(trunk), [0, 0.3, 0.71]),
    ...windowsGrid(kit, [-0.5, 0.5], [0.66], 0.71)
  )
  return g
}

const workshop: Builder = (kit) => {
  const {wall, accent, trunk, metal} = kit.colors
  const gear = kit.mesh(new THREE.TorusGeometry(0.28, 0.08, 6, 10), kit.material(metal))
  gear.position.set(0.66, 0.7, 0.74)
  const g = new THREE.Group()
  g.add(
    box(kit, [2, 1, 1.4], kit.material(wall), [0, 0.5, 0]),
    hipRoof(kit, 2, 1.4, 0.7, accent, 1),
    box(kit, [0.8, 0.72, 0.04], kit.material(trunk), [-0.3, 0.36, 0.71]),
    gear,
    box(kit, [0.4, 0.4, 0.4], kit.material(trunk), [1.3, 0.2, 0.35]),
    box(kit, [0.3, 0.3, 0.3], kit.material(trunk), [1.3, 0.15, -0.15])
  )
  return g
}

const school: Builder = (kit) => {
  const {wall, roof, stone, metal, accent} = kit.colors
  const columns = [-1.1, -0.5, 0.5, 1.1].map((x) => {
    const column = kit.mesh(new THREE.CylinderGeometry(0.09, 0.09, 1, 6), kit.material(wall))
    column.position.set(x, 0.5, 0.95)
    return column
  })
  const g = new THREE.Group()
  g.add(
    box(kit, [2.8, 1.2, 1.6], kit.material(wall), [0, 0.6, 0]),
    hipRoof(kit, 3, 2, 0.6, roof, 1.2),
    box(kit, [1.6, 0.12, 0.4], kit.material(stone), [0, 0.06, 1.15]),
    ...columns,
    post(kit, 2.3, metal, [1.7, 0.6]),
    box(kit, [0.5, 0.3, 0.02], kit.material(accent), [1.96, 2.1, 0.6]),
    ...windowsGrid(kit, [-0.8, 0, 0.8], [0.7], 0.81)
  )
  return g
}

const office: Builder = (kit) => {
  const {wall, trainDark} = kit.colors
  const g = new THREE.Group()
  g.add(
    box(kit, [1.8, 1.9, 1.5], kit.material(wall), [0, 0.95, 0]),
    box(kit, [1.95, 0.12, 1.65], kit.material(trainDark), [0, 1.96, 0]),
    ...windowsGrid(kit, [-0.5, 0, 0.5], [0.6, 1.35], 0.76)
  )
  return g
}

const press: Builder = (kit) => {
  const {wall, accent, trainDark} = kit.colors
  const stack = kit.mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.2, 8), kit.material(trainDark))
  stack.position.set(-0.55, 3.1, -0.4)
  const g = new THREE.Group()
  g.add(
    box(kit, [1.7, 2.5, 1.6], kit.material(wall), [0, 1.25, 0]),
    box(kit, [1.4, 0.45, 0.08], kit.material(accent), [0, 2.85, 0.45]),
    stack,
    ...windowsGrid(kit, [-0.45, 0.45], [0.8, 1.6], 0.81)
  )
  return g
}

const tower: Builder = (kit) => {
  const {wall, accent, metal} = kit.colors
  const antenna = kit.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 5), kit.material(metal))
  antenna.position.y = 3.95
  const g = new THREE.Group()
  g.add(
    box(kit, [1.5, 3.4, 1.5], kit.material(wall), [0, 1.7, 0]),
    box(kit, [1.6, 0.25, 1.6], kit.material(accent), [0, 3.4, 0]),
    antenna,
    ...windowsGrid(kit, [-0.35, 0.35], [0.7, 1.4, 2.1, 2.8], 0.76)
  )
  return g
}

const BOARD_HEIGHT = 1.75
// Two rows of five on a plaza; the back row stands taller so it shows over the front.
const YARD = {columns: 5, spacing: 2, rows: [{z: 0.7, lift: 0}, {z: -1.3, lift: 0.9}], plaza: [10.6, 0.06, 4]} as const

/** One project billboard showing its logo; the origin is its ground centre. */
function billboard(kit: Kit, image: string, loadAssets: boolean, lift: number): THREE.Group {
  const {wall, trunk, roof} = kit.colors
  const g = new THREE.Group()
  g.add(
    post(kit, 1.5 + lift, trunk, [-0.65, 0]),
    post(kit, 1.5 + lift, trunk, [0.65, 0]),
    box(kit, [1.6, 1.15, 0.1], kit.material(wall), [0, BOARD_HEIGHT + lift, 0]),
    box(kit, [1.8, 0.08, 0.32], kit.material(roof), [0, BOARD_HEIGHT + 0.63 + lift, 0.05])
  )
  if (loadAssets) {
    const texture = new THREE.TextureLoader().load(image)
    texture.colorSpace = THREE.SRGBColorSpace
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.95), new THREE.MeshBasicMaterial({map: texture, toneMapped: false}))
    logo.position.set(0, BOARD_HEIGHT + lift, 0.056)
    g.add(logo)
  }
  // The camera aims here when this project is picked.
  g.userData.boardHeight = BOARD_HEIGHT + lift
  return g
}

/** The Projects stop: every project's billboard on one plaza, named billboard-<k>. */
const yard: Builder = (kit, station, loadAssets) => {
  const g = new THREE.Group()
  const plaza = box(kit, [...YARD.plaza], kit.material(kit.colors.platform), [0, 0.03, -0.3])
  g.add(plaza)
  ;(station.images ?? []).forEach((image, k) => {
    const row = YARD.rows[Math.floor(k / YARD.columns)] ?? YARD.rows[YARD.rows.length - 1]
    const board = billboard(kit, image, loadAssets, row.lift)
    board.position.set(((k % YARD.columns) - (YARD.columns - 1) / 2) * YARD.spacing, 0, row.z)
    board.name = `billboard-${k}`
    g.add(board)
  })
  return g
}

const postOffice: Builder = (kit) => {
  const {wall, accent, metal} = kit.colors
  const g = new THREE.Group()
  g.add(
    box(kit, [1.6, 1, 1.3], kit.material(wall), [0, 0.5, 0]),
    hipRoof(kit, 1.6, 1.3, 0.7, accent, 1),
    post(kit, 0.6, metal, [1.05, 0.6]),
    box(kit, [0.32, 0.42, 0.26], kit.material(accent), [1.05, 0.8, 0.6]),
    ...windowsGrid(kit, [-0.45, 0.45], [0.6], 0.66)
  )
  return g
}

export const BUILDERS: Readonly<Record<StationKind, Builder>> = {
  home,
  workshop,
  school,
  office,
  press,
  tower,
  yard,
  post: postOffice
}
