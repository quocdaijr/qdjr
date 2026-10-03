import * as THREE from 'three'

// A small comet on a long ellipse through the outer system — the galaxy
// vibe's clickable easter egg (clicking it bursts it into a meteor shower).
const ORBIT = {a: 21, b: 13, lap: 40, tilt: 0.35, y: 2}
const HEAD = 0.25
const HIT_RADIUS = 1.2

export interface Comet {
  group: THREE.Group
  update(elapsed: number): void
}

export function buildComet(color: number): Comet {
  const group = new THREE.Group()
  group.name = 'comet'
  group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(HEAD, 1), new THREE.MeshBasicMaterial({color})))
  const tail = new THREE.Mesh(
    new THREE.ConeGeometry(HEAD * 1.2, HEAD * 10, 10, 1, true),
    new THREE.MeshBasicMaterial({color, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false})
  )
  tail.rotation.z = Math.PI / 2 // lies along +x behind the head
  tail.position.x = HEAD * 5
  group.add(tail)
  // Generous invisible hit area: the comet is small and fast.
  group.add(new THREE.Mesh(new THREE.SphereGeometry(HIT_RADIUS, 8, 6), new THREE.MeshBasicMaterial({visible: false})))

  const next = new THREE.Vector3()
  return {
    group,
    update(elapsed) {
      const at = (t: number) => {
        const a = (t / ORBIT.lap) * Math.PI * 2
        return next.set(Math.cos(a) * ORBIT.a, ORBIT.y + Math.sin(a) * ORBIT.b * Math.sin(ORBIT.tilt), Math.sin(a) * ORBIT.b)
      }
      group.position.copy(at(elapsed))
      // Tail points away from the sun (the origin).
      group.lookAt(0, 0, 0)
      group.rotateY(Math.PI / 2)
    }
  }
}
