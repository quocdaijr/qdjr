import * as THREE from 'three'
import {describe, expect, test} from 'vitest'
import {projectsStopIndex} from '~/data/journeyStations'
import {PROFILE_CONTENT} from '~/data/profile'
import {createGalaxyScene} from '~/scenes/galaxy'

const POINTER = {x: 0, y: 0}
const PROJECTS = PROFILE_CONTENT.en.projects
const STOP = projectsStopIndex(PROFILE_CONTENT.en)
const build = (reduceMotion = false) => createGalaxyScene({isDark: true, aspect: 16 / 9, loadAssets: false, reduceMotion})
const world = (o: THREE.Object3D) => o.getWorldPosition(new THREE.Vector3())

describe('galaxy projects constellations', () => {
  test('one star per project; lines join stars of the same employer only', () => {
    const built = build()
    PROJECTS.forEach((_, k) => expect(built.scene.getObjectByName(`star-${k}`)).toBeTruthy())
    const lines = built.scene.getObjectByName('constellation-lines') as THREE.LineSegments
    const pairs = lines.userData.pairs as Array<[number, number]>
    expect(pairs.length).toBeGreaterThan(0)
    for (const [a, b] of pairs) expect(PROJECTS[a].group).toBe(PROJECTS[b].group)
    expect(lines.geometry.attributes.position.count).toBe(pairs.length * 2)
  })

  test('the sky is the same on every visit', () => {
    const a = world(build().scene.getObjectByName('star-4')!)
    const b = world(build().scene.getObjectByName('star-4')!)
    expect(a.toArray()).toEqual(b.toArray())
  })

  test('the picked star lands on the same spot on screen', () => {
    const last = PROJECTS.length - 1
    const screenX = (focus: number, k: number) => {
      const built = build(true)
      built.update(0, 0, 0, POINTER, STOP, focus)
      built.camera.updateMatrixWorld()
      return world(built.scene.getObjectByName(`star-${k}`)!).project(built.camera).x
    }
    expect(Math.abs(screenX(0, 0) - screenX(last, last))).toBeLessThan(0.2)
    expect(Math.abs(screenX(0, last) - screenX(last, last))).toBeGreaterThan(0.3)
  })

  test('picking a project fires a shooting star at its star', () => {
    const built = build()
    built.update(1 / 60, 0, 0, POINTER, STOP, 0)
    built.update(1 / 60, 0.1, 0, POINTER, STOP, 3)
    const target = world(built.scene.getObjectByName('star-3')!)
    const streaks = built.scene.getObjectByName('streaks')!.children.filter((c) => c.visible && c.userData.to)
    expect(streaks.some((s) => new THREE.Vector3(...(s.userData.to as [number, number, number])).distanceTo(target) < 1e-6)).toBe(true)
  })

  test('shooting stars pass by now and then; none under reduced motion', () => {
    const moving = build()
    for (let i = 0; i < 60 * 15; i++) moving.update(1 / 60, i / 60, 0, POINTER, null, null)
    expect(moving.scene.getObjectByName('streaks')!.userData.launched).toBeGreaterThan(1)

    const still = build(true)
    still.update(0, 0, 0, POINTER, STOP, 0)
    still.update(0, 0, 0, POINTER, STOP, 5)
    expect(still.scene.getObjectByName('streaks')!.userData.launched).toBe(0)
  })

  test('away from the projects stop the camera follows the journey as before', () => {
    const a = build()
    const b = build()
    for (let i = 0; i < 120; i++) {
      a.update(1 / 60, i / 60, 0.4, POINTER, 3, null)
      b.update(1 / 60, i / 60, 0.4, POINTER, null, null)
    }
    expect(a.camera.position.distanceTo(b.camera.position)).toBeLessThan(1e-6)
  })

  test('leaving the projects stop eases the camera back to the journey path', () => {
    const built = build()
    for (let i = 0; i < 300; i++) built.update(1 / 60, i / 60, 0.8, POINTER, STOP, 2)
    const onProjects = built.camera.position.clone()
    for (let i = 0; i < 600; i++) built.update(1 / 60, 5 + i / 60, 0.9, POINTER, STOP + 1, null)
    const reference = build()
    for (let i = 0; i < 600; i++) reference.update(1 / 60, 5 + i / 60, 0.9, POINTER, STOP + 1, null)
    expect(built.camera.position.distanceTo(reference.camera.position)).toBeLessThan(0.05)
    expect(built.camera.position.distanceTo(onProjects)).toBeGreaterThan(1)
  })
})
