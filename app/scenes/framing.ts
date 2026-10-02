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
