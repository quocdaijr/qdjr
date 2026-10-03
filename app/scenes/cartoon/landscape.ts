import * as THREE from 'three'
import type {Kit} from './kit'
import {HILLS} from './layout'

// Relief: rounded hills inside the loop, rock breaking through their tops,
// and far off in the haze, snow-capped peaks on floating rocks of their own.

// Behind the island as the cameras see it (they look from the front-right), low on the horizon and
// small, so they read as distance and never sit behind the page's text.
const PEAKS: ReadonlyArray<{x: number; y: number; z: number; size: number}> = [
  {x: 34, y: -14, z: -96, size: 1.1},
  {x: 70, y: -18, z: -70, size: 0.8},
  {x: 2, y: -20, z: -122, size: 1.3}
]

function hill(kit: Kit, h: {x: number; z: number; r: number; h: number}): THREE.Group {
  const dome = kit.mesh(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), kit.material(kit.colors.leaf))
  dome.scale.set(h.r, h.h, h.r)
  const rock = kit.mesh(new THREE.DodecahedronGeometry(h.r * 0.28, 0), kit.material(kit.colors.stone))
  rock.position.y = h.h * 0.92
  rock.scale.y = 0.7
  const g = new THREE.Group()
  g.add(dome, rock)
  g.position.set(h.x, 0, h.z)
  g.name = 'hill'
  return g
}

/** A floating rock with a mountain on it, a snow cap on the mountain. */
function peak(kit: Kit, p: (typeof PEAKS)[number]): THREE.Group {
  const rock = kit.mesh(new THREE.ConeGeometry(5, 7, 7), kit.material(kit.colors.cliff))
  rock.rotation.x = Math.PI
  rock.position.y = -3.5
  const mountain = kit.mesh(new THREE.ConeGeometry(5.2, 8, 7), kit.material(kit.colors.leafDark))
  mountain.position.y = 4
  const snow = kit.mesh(new THREE.ConeGeometry(1.9, 2.9, 7), kit.material(kit.colors.cloud))
  snow.position.y = 6.6
  const g = new THREE.Group()
  g.add(rock, mountain, snow)
  g.position.set(p.x, p.y, p.z)
  g.scale.setScalar(p.size)
  g.name = 'far-peak'
  return g
}

/** Hills on the island; the far peaks apart, so they stay out of the island's framing. */
export function buildLandscape(kit: Kit): {hills: THREE.Group; peaks: THREE.Group} {
  const hills = new THREE.Group()
  hills.name = 'hills'
  hills.add(...HILLS.map((h) => hill(kit, h)))
  const peaks = new THREE.Group()
  peaks.name = 'far-peaks'
  peaks.add(...PEAKS.map((p) => peak(kit, p)))
  return {hills, peaks}
}
