import * as THREE from 'three'
import {describe, expect, test} from 'vitest'
import {journeyStations, projectsStopIndex} from '~/data/journeyStations'
import {PROFILE_CONTENT} from '~/data/profile'
import {createTerminalScene} from '~/scenes/terminal'

const POINTER = {x: 0, y: 0}
const STOPS = journeyStations(PROFILE_CONTENT.en).length
const PROJECTS_STOP = projectsStopIndex(PROFILE_CONTENT.en)
const PROJECTS = PROFILE_CONTENT.en.projects
const build = (reduceMotion = false) => createTerminalScene({isDark: true, aspect: 16 / 9, loadAssets: false, reduceMotion})
const world = (o: THREE.Object3D) => o.getWorldPosition(new THREE.Vector3())
const ndc = (built: ReturnType<typeof build>, o: THREE.Object3D) => {
  built.camera.updateMatrixWorld()
  return world(o).project(built.camera)
}
const matrices = (built: ReturnType<typeof build>) => Array.from((built.scene.getObjectByName('packets') as THREE.InstancedMesh).instanceMatrix.array)

describe('coding journey as a system-design map', () => {
  test('one node per stop and one pod per project', () => {
    const built = build()
    for (let i = 0; i < STOPS; i++) expect(built.scene.getObjectByName(`arch-anchor-${i}`)).toBeTruthy()
    PROJECTS.forEach((_, k) => expect(built.scene.getObjectByName(`pod-${k}`)).toBeTruthy())
  })

  test('each stop frames its node right of the panel from the first frame', () => {
    for (let i = 0; i < STOPS; i++) {
      const built = build(true)
      built.update(0, 0, 0, POINTER, i, null)
      const p = ndc(built, built.scene.getObjectByName(`arch-anchor-${i}`)!)
      expect(p.x, `stop ${i}`).toBeGreaterThan(0.05)
      expect(p.x, `stop ${i}`).toBeLessThan(0.85)
      expect(Math.abs(p.y), `stop ${i}`).toBeLessThan(0.7)
    }
  })

  test('moving between stops eases (no jumps)', () => {
    const built = build()
    for (let i = 0; i < 120; i++) built.update(1 / 60, i / 60, 0, POINTER, 1, null)
    let prev = built.camera.position.clone()
    for (let i = 0; i < 240; i++) {
      built.update(1 / 60, 2 + i / 60, 0, POINTER, 6, null)
      expect(built.camera.position.distanceTo(prev)).toBeLessThan(2)
      prev = built.camera.position.clone()
    }
  })

  test('picking a project zooms onto its pod and dims the others', () => {
    const picked = build(true)
    picked.update(0, 0, 0, POINTER, PROJECTS_STOP, 4)
    const pod = picked.scene.getObjectByName('pod-4')!
    const zoomed = picked.camera.position.distanceTo(world(pod))
    const overview = build(true)
    overview.update(0, 0, 0, POINTER, PROJECTS_STOP, null)
    expect(overview.camera.position.distanceTo(world(pod)) / zoomed).toBeGreaterThan(2.5)
    const opacity = (k: number) => ((picked.scene.getObjectByName(`pod-${k}`) as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity
    PROJECTS.forEach((_, k) => k !== 4 && expect(opacity(4)).toBeGreaterThan(opacity(k)))
  })

  test('the picked pod lands where every picked pod lands', () => {
    const at = (k: number) => {
      const built = build(true)
      built.update(0, 0, 0, POINTER, PROJECTS_STOP, k)
      return ndc(built, built.scene.getObjectByName(`pod-${k}`)!)
    }
    expect(Math.abs(at(0).x - at(9).x)).toBeLessThan(0.15)
    expect(at(0).x).toBeGreaterThan(0.05)
  })

  test('request packets flow along the wires; none move under reduced motion', () => {
    const moving = build()
    moving.update(1 / 60, 0, 0, POINTER, 2, null)
    const before = matrices(moving)
    for (let i = 1; i <= 120; i++) moving.update(1 / 60, i / 60, 0, POINTER, 2, null)
    expect(matrices(moving)).not.toEqual(before)

    const still = build(true)
    still.update(0, 0, 0, POINTER, 2, null)
    const frozen = matrices(still)
    still.update(0, 2, 0, POINTER, 2, null)
    expect(matrices(still)).toEqual(frozen)
  })

  test('moving to the next stop sends a burst along the wire just travelled', () => {
    const built = build()
    built.update(1 / 60, 0, 0, POINTER, 3, null)
    built.update(1 / 60, 0.1, 0, POINTER, 4, null)
    expect(built.scene.getObjectByName('packets')!.userData.burst).toEqual([3, 4])
  })
})
