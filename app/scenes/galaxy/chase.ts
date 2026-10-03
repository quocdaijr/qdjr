import * as THREE from 'three'
import {panelAim} from '../framing'

// Where the camera stands to frame one body of the system: on its sunlit
// side, a little above and to the side, farther for bigger bodies; aimed so
// the body clears the /about panel.
const DISTANCE = {base: 1.4, perRadius: 7}
const UP = new THREE.Vector3(0, 1, 0)
const SUN_VIEW = new THREE.Vector3(0.4, 0.35, 1).normalize()
const FRAME = {shift: 0.42, drop: 0.3} // fractions of the camera distance

export interface Shot {
  eye: THREE.Vector3
  look: THREE.Vector3
}

export interface ShotOptions {
  /** Stand-off before scaling by radius; small craft get a closer one. */
  base?: number
  /** Side to stand on. Default: towards the sun at the origin (the lit face). */
  towards?: THREE.Vector3
}

export function chaseShot(target: THREE.Vector3, radius: number, aspect: number, {base = DISTANCE.base, towards}: ShotOptions = {}): Shot {
  const facing = towards?.clone().normalize() ?? (target.lengthSq() < 1e-6 ? SUN_VIEW.clone() : target.clone().negate().normalize())
  const side = new THREE.Vector3().crossVectors(facing, UP).normalize()
  const dir = facing.multiplyScalar(0.7).addScaledVector(side, 0.55).addScaledVector(UP, 0.45).normalize()
  const distance = base + radius * DISTANCE.perRadius
  const eye = target.clone().addScaledVector(dir, distance)
  const look = panelAim(target, eye, aspect, {shift: distance * FRAME.shift, drop: distance * FRAME.drop})
  return {eye, look}
}
