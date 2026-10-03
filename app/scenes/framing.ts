import * as THREE from 'three'

// Where to point a camera so its subject clears the /about text panel. Wide
// screens: the panel sits left, so aim left of the subject (it lands right of
// centre). Phones: the panel is centred low, so aim below the subject (it
// lands in the strip above). Blends between the two from aspect 0.8 to 1.6.
export interface PanelAimOptions {
  shift: number
  drop: number
}

const UP = new THREE.Vector3(0, 1, 0)

export function panelAim(subject: THREE.Vector3, eye: THREE.Vector3, aspect: number, {shift, drop}: PanelAimOptions): THREE.Vector3 {
  const wide = THREE.MathUtils.clamp((aspect - 0.8) / 0.8, 0, 1)
  const right = new THREE.Vector3().subVectors(subject, eye).cross(UP).normalize()
  const look = subject.clone().addScaledVector(right, -shift * wide)
  look.y -= drop * (1 - wide)
  return look
}

// Home-page framing: the whole model in view at any screen shape. Wide
// screens: right of centre, spreading partly under the hero. Phones: below
// the hero text. Spans and centres are in NDC (−1..1).
const HOME_WIDE = {centre: [0.4, -0.12], span: [1.15, 1.72]} as const
const HOME_NARROW = {centre: [0, -0.45], span: [1.9, 0.85]} as const

export interface Shot {
  eye: THREE.Vector3
  look: THREE.Vector3
}

const BISECT_STEPS = 40
const WORLD_UP = new THREE.Vector3(0, 1, 0)

/** Smallest x for which `f` is non-increasing past zero, by bisection over [lo, hi]. */
function bisect(lo: number, hi: number, f: (x: number) => number): number {
  for (let i = 0; i < BISECT_STEPS; i++) {
    const mid = (lo + hi) / 2
    if (f(mid) > 0) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

/**
 * Camera for the home page: looking along −`from` at `box`, with the distance
 * and a sideways/vertical shift (not a turn, so the perspective stays put)
 * that put the box's projection at the target size and place for this aspect.
 * Size falls with distance and position moves with the shift, so plain
 * bisection on each finds the answer.
 */
export function fitShot(box: THREE.Box3, from: THREE.Vector3, aspect: number, fov: number): Shot {
  const target = aspect < 1 ? HOME_NARROW : HOME_WIDE
  const dir = from.clone().normalize()
  const forward = dir.clone().negate()
  const right = new THREE.Vector3().crossVectors(forward, WORLD_UP).normalize()
  const up = new THREE.Vector3().crossVectors(right, forward)
  const centre = box.getCenter(new THREE.Vector3())
  const tan = Math.tan(THREE.MathUtils.degToRad(fov / 2))
  // Box corners in the camera's frame, relative to the box centre.
  const corners: Array<[number, number, number]> = []
  for (const x of [box.min.x, box.max.x]) {
    for (const y of [box.min.y, box.max.y]) {
      for (const z of [box.min.z, box.max.z]) {
        const c = new THREE.Vector3(x, y, z).sub(centre)
        corners.push([c.dot(right), c.dot(up), c.dot(dir)])
      }
    }
  }
  const project = (d: number, sx: number, sy: number) => {
    const xs = corners.map(([x, , z]) => (x - sx) / ((d - z) * tan * aspect))
    const ys = corners.map(([, y, z]) => (y - sy) / ((d - z) * tan))
    return {minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys)}
  }
  const reach = box.getBoundingSphere(new THREE.Sphere()).radius
  // For a distance, the shifts that centre the projection on the target point.
  const shifts = (d: number): [number, number] => [
    bisect(-reach * 20, reach * 20, (sx) => {
      const b = project(d, sx, 0)
      return (b.minX + b.maxX) / 2 - target.centre[0]
    }),
    bisect(-reach * 20, reach * 20, (sy) => {
      const b = project(d, 0, sy)
      return (b.minY + b.maxY) / 2 - target.centre[1]
    })
  ]
  const nearest = Math.max(...corners.map(([, , z]) => z)) + 0.5
  const distance = bisect(nearest, reach * 50, (d) => {
    const [sx, sy] = shifts(d)
    const b = project(d, sx, sy)
    return Math.max((b.maxX - b.minX) / target.span[0], (b.maxY - b.minY) / target.span[1]) - 1
  })
  const [sx, sy] = shifts(distance)
  const eye = centre.clone().addScaledVector(dir, distance).addScaledVector(right, sx).addScaledVector(up, sy)
  return {eye, look: eye.clone().add(forward)}
}

/**
 * The home-page shot for `model` seen from direction `from`, refit only when
 * the screen shape changes, with a little pointer sway on top. Parts of the
 * model below `floor` don't count towards the fit.
 */
export function homeFraming(model: THREE.Object3D, from: THREE.Vector3, fov: number, sway: number, floor = -Infinity) {
  let aspect = 0
  let shot: Shot | null = null
  return (cameraAspect: number, pointer: {x: number; y: number}): Shot => {
    if (!shot || cameraAspect !== aspect) {
      model.updateWorldMatrix(true, true)
      const box = new THREE.Box3().setFromObject(model, true)
      // Ignore whatever hangs below `floor` (the cartoon island's rock base).
      box.min.y = Math.max(box.min.y, floor)
      shot = fitShot(box, from, cameraAspect, fov)
      aspect = cameraAspect
    }
    return {eye: shot.eye.clone().add(new THREE.Vector3(pointer.x * sway, -pointer.y * sway * 0.5, 0)), look: shot.look.clone()}
  }
}
