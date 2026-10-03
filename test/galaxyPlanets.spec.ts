import * as THREE from 'three'
import {describe, expect, test} from 'vitest'
import {journeyStations, projectsStopIndex} from '~/data/journeyStations'
import {PROFILE_CONTENT} from '~/data/profile'
import {createGalaxyScene} from '~/scenes/galaxy'

const POINTER = {x: 0, y: 0}
const STOPS = journeyStations(PROFILE_CONTENT.en).length
const PROJECTS_STOP = projectsStopIndex(PROFILE_CONTENT.en)
const PROJECTS = PROFILE_CONTENT.en.projects
const build = (reduceMotion = false, aspect = 16 / 9) => createGalaxyScene({isDark: true, aspect, loadAssets: false, reduceMotion})
const world = (o: THREE.Object3D) => o.getWorldPosition(new THREE.Vector3())
const ndc = (built: ReturnType<typeof build>, o: THREE.Object3D) => {
  built.camera.updateMatrixWorld()
  return world(o).project(built.camera)
}

describe('galaxy journey anchored to bodies', () => {
  test('one anchor per stop; the projects stop is earth', () => {
    const built = build()
    for (let i = 0; i < STOPS; i++) expect(built.scene.getObjectByName(`galaxy-anchor-${i}`)).toBeTruthy()
    expect(built.scene.getObjectByName(`galaxy-anchor-${PROJECTS_STOP}`)?.userData.body).toBe('earth')
    expect(built.scene.getObjectByName('galaxy-anchor-0')?.userData.body).toBe('sun')
  })

  test('each stop frames its body right of the panel from the first frame', () => {
    for (let i = 0; i < STOPS; i++) {
      const built = build(true)
      built.update(0, 0, 0, POINTER, i, null)
      const p = ndc(built, built.scene.getObjectByName(`galaxy-anchor-${i}`)!)
      expect(p.x, `stop ${i}`).toBeGreaterThan(0.05)
      expect(p.x, `stop ${i}`).toBeLessThan(0.85)
      expect(Math.abs(p.y), `stop ${i}`).toBeLessThan(0.7)
    }
  })

  test('moving between stops eases (no jumps)', () => {
    const built = build()
    for (let i = 0; i < 120; i++) built.update(1 / 60, i / 60, 0, POINTER, 2, null)
    let prev = built.camera.position.clone()
    for (let i = 0; i < 240; i++) {
      built.update(1 / 60, 2 + i / 60, 0, POINTER, 5, null)
      expect(built.camera.position.distanceTo(prev)).toBeLessThan(2)
      prev = built.camera.position.clone()
    }
  })

  test('the sky is the same on every visit', () => {
    const a = build()
    const b = build()
    a.update(0, 0, 0, POINTER, 3, null)
    b.update(0, 0, 0, POINTER, 3, null)
    expect(world(a.scene.getObjectByName('galaxy-anchor-3')!).toArray()).toEqual(world(b.scene.getObjectByName('galaxy-anchor-3')!).toArray())
  })
})

describe('projects orbit earth', () => {
  test('ten orbiters of mixed kinds around earth', () => {
    const built = build()
    built.update(0, 0, 0, POINTER, PROJECTS_STOP, null)
    const earth = built.scene.getObjectByName(`galaxy-anchor-${PROJECTS_STOP}`)!
    const kinds = PROJECTS.map((_, k) => {
      const o = built.scene.getObjectByName(`orbiter-${k}`)!
      expect(world(o).distanceTo(world(earth))).toBeLessThan(4)
      return o.userData.kind
    })
    expect(new Set(kinds)).toEqual(new Set(['moon', 'satellite', 'station', 'meteor', 'probe']))
  })

  test('picking a project zooms the camera onto its orbiter', () => {
    // Apparent size ∝ radius / distance. Unpicked, the camera frames Earth, so
    // measure from Earth's centre (orbiters swing nearer and farther).
    const picked = build(true)
    picked.update(0, 0, 0, POINTER, PROJECTS_STOP, 4)
    const o = picked.scene.getObjectByName('orbiter-4')!
    const zoomed = picked.camera.position.distanceTo(world(o))
    const overview = build(true)
    overview.update(0, 0, 0, POINTER, PROJECTS_STOP, null)
    const earth = overview.scene.getObjectByName(`galaxy-anchor-${PROJECTS_STOP}`)!
    expect(overview.camera.position.distanceTo(world(earth)) / zoomed).toBeGreaterThan(3)
  })

  test('the picked orbiter lands where every picked orbiter lands', () => {
    const at = (k: number) => {
      const built = build(true)
      built.update(0, 0, 0, POINTER, PROJECTS_STOP, k)
      return ndc(built, built.scene.getObjectByName(`orbiter-${k}`)!)
    }
    expect(Math.abs(at(0).x - at(9).x)).toBeLessThan(0.15)
    expect(at(0).x).toBeGreaterThan(0.05)
  })

  test('a picked orbiter holds still on its orbit while picked', () => {
    const built = build()
    built.update(1 / 60, 0, 0, POINTER, PROJECTS_STOP, 2)
    const o = built.scene.getObjectByName('orbiter-2')!
    const before = o.parent!.rotation.y
    for (let i = 0; i < 120; i++) built.update(1 / 60, i / 60, 0, POINTER, PROJECTS_STOP, 2)
    expect(o.parent!.rotation.y).toBe(before)
  })

  test('picking an orbiter sends a shooting star right past it', () => {
    const built = build()
    built.update(1 / 60, 0, 0, POINTER, PROJECTS_STOP, 0)
    built.update(1 / 60, 0.1, 0, POINTER, PROJECTS_STOP, 6)
    const p = world(built.scene.getObjectByName('orbiter-6')!)
    const line = built.scene.getObjectByName('streaks')!.children.find((c) => c.visible && c.userData.from)!
    const segment = new THREE.Line3(new THREE.Vector3(...line.userData.from), new THREE.Vector3(...line.userData.to))
    expect(segment.closestPointToPoint(p, true, new THREE.Vector3()).distanceTo(p)).toBeLessThan(0.6)
  })

  test('no shooting stars under reduced motion', () => {
    const still = build(true)
    still.update(0, 0, 0, POINTER, PROJECTS_STOP, 0)
    still.update(0, 0, 0, POINTER, PROJECTS_STOP, 5)
    expect(still.scene.getObjectByName('streaks')!.userData.launched).toBe(0)
  })
})

test('a picked orbiter is framed from outside earth, whichever side of earth it is on', () => {
  for (let k = 0; k < PROJECTS.length; k++) {
    const built = build(true)
    built.update(0, 0, 0, POINTER, PROJECTS_STOP, k)
    const earth = world(built.scene.getObjectByName(`galaxy-anchor-${PROJECTS_STOP}`)!)
    expect(built.camera.position.distanceTo(earth), `orbiter ${k}`).toBeGreaterThan(0.55 * 1.2)
    const p = ndc(built, built.scene.getObjectByName(`orbiter-${k}`)!)
    expect(p.z, `orbiter ${k} in front of the camera`).toBeLessThan(1)
  }
})
