import * as THREE from 'three'
import {describe, expect, test} from 'vitest'
import {projectsStopIndex} from '~/data/journeyStations'
import {PROFILE_CONTENT} from '~/data/profile'
import {BRANCH_COMMITS, layoutGraph} from '~/scenes/terminal/graph'
import {createTerminalScene} from '~/scenes/terminal'

const POINTER = {x: 0, y: 0}
const PROJECTS = PROFILE_CONTENT.en.projects
const STOP = projectsStopIndex(PROFILE_CONTENT.en)
const build = (reduceMotion = false) => createTerminalScene({isDark: true, aspect: 16 / 9, loadAssets: false, reduceMotion})
const world = (o: THREE.Object3D) => o.getWorldPosition(new THREE.Vector3())
const dist = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

describe('commit graph layout', () => {
  const graph = layoutGraph(PROJECTS)

  test('one trunk per employer and one branch per project', () => {
    expect(graph.trunks).toHaveLength(2)
    expect(graph.branches).toHaveLength(PROJECTS.length)
    for (const b of graph.branches) expect(b.commits).toHaveLength(BRANCH_COMMITS)
  })

  test('a branch forks off and merges back into its own employer trunk', () => {
    graph.branches.forEach((b, k) => {
      const trunk = graph.trunks[b.trunk]
      expect(PROJECTS[k].group).toBe(PROJECTS[graph.branches.findIndex((o) => o.trunk === b.trunk)].group)
      expect(trunk.some((p) => dist(p, b.fork) < 1e-9)).toBe(true)
      expect(trunk.some((p) => dist(p, b.merge) < 1e-9)).toBe(true)
      expect(b.merge[0]).toBeGreaterThan(b.fork[0])
    })
  })

  test('no two commits crowd each other, and the layout never changes', () => {
    const nodes = [...graph.trunks.flat(), ...graph.branches.flatMap((b) => b.commits)]
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) expect(dist(nodes[i], nodes[j])).toBeGreaterThanOrEqual(0.9)
    expect(layoutGraph(PROJECTS)).toEqual(graph)
  })
})

describe('terminal projects commit graph', () => {
  test('one branch group per project and a HEAD marker', () => {
    const built = build()
    PROJECTS.forEach((_, k) => expect(built.scene.getObjectByName(`branch-${k}`)).toBeTruthy())
    expect(built.scene.getObjectByName('HEAD')).toBeTruthy()
  })

  test('picking a project lights its branch and moves HEAD to its tip', () => {
    const built = build(true)
    built.update(0, 0, 0, POINTER, STOP, 6)
    const opacity = (k: number) => ((built.scene.getObjectByName(`branch-line-${k}`) as THREE.Line).material as THREE.LineBasicMaterial).opacity
    PROJECTS.forEach((_, k) => k !== 6 && expect(opacity(6)).toBeGreaterThan(opacity(k)))
    const tip = built.scene.getObjectByName('branch-6')!.userData.tip as THREE.Vector3
    expect(world(built.scene.getObjectByName('HEAD')!).distanceTo(tip)).toBeLessThan(1e-6)
  })

  test('the picked branch tip lands on the same spot on screen', () => {
    const last = PROJECTS.length - 1
    const screenX = (focus: number, k: number) => {
      const built = build(true)
      built.update(0, 0, 0, POINTER, STOP, focus)
      built.camera.updateMatrixWorld()
      return (built.scene.getObjectByName(`branch-${k}`)!.userData.tip as THREE.Vector3).clone().project(built.camera).x
    }
    expect(Math.abs(screenX(0, 0) - screenX(last, last))).toBeLessThan(0.2)
    expect(Math.abs(screenX(0, last) - screenX(last, last))).toBeGreaterThan(0.3)
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
