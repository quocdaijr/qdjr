import * as THREE from 'three'
import {describe, expect, test} from 'vitest'
import {createCartoonScene} from '~/scenes/cartoon'
import {createGalaxyScene} from '~/scenes/galaxy'
import {createTerminalScene} from '~/scenes/terminal'
import {approach, type SceneFactory} from '~/scenes/types'

// Scene factories build plain three.js object graphs; no renderer (and so no
// WebGL) is needed to check the contract VibeScene.vue relies on.
const FACTORIES: Record<string, SceneFactory> = {
  terminal: createTerminalScene,
  cartoon: createCartoonScene,
  galaxy: createGalaxyScene
}

const POINTER = {x: 0, y: 0}

describe.each(Object.entries(FACTORIES))('%s scene', (_name, factory) => {
  test('builds a populated scene with a perspective camera in both modes', () => {
    for (const isDark of [true, false]) {
      const built = factory({isDark, aspect: 16 / 9, loadAssets: false})
      expect(built.scene.children.length).toBeGreaterThan(0)
      expect(built.camera.isPerspectiveCamera).toBe(true)
      expect(built.camera.aspect).toBeCloseTo(16 / 9)
    }
  })

  test('moves the camera between journey start and end', () => {
    const built = factory({isDark: true, aspect: 1, loadAssets: false})

    // Terminal and galaxy follow progress; the cartoon train follows the stop.
    for (let i = 0; i < 600; i++) built.update(1 / 60, i / 60, 0, POINTER, 0)
    const start = built.camera.position.clone()
    for (let i = 0; i < 600; i++) built.update(1 / 60, 10 + i / 60, 1, POINTER, 16)
    const end = built.camera.position.clone()

    expect(start.distanceTo(end)).toBeGreaterThan(1)
    expect([...end.toArray(), ...start.toArray()].every(Number.isFinite)).toBe(true)
  })

  test('survives a long run of frames without producing NaN', () => {
    const built = factory({isDark: false, aspect: 0.5, loadAssets: false})
    for (let i = 0; i < 600; i++) built.update(0.1, i * 0.1, (i % 100) / 100, {x: 0.5, y: -0.5}, null)
    expect(built.camera.position.toArray().every(Number.isFinite)).toBe(true)
  })
})

describe('approach', () => {
  test('moves toward the target by a dt-scaled fraction and never overshoots', () => {
    expect(approach(0, 10, 0.1, 3)).toBeCloseTo(3)
    expect(approach(0, 10, 1, 3)).toBe(10)
    expect(approach(10, 10, 0.5, 3)).toBe(10)
  })
})

describe('cartoon train', () => {
  const build = (reduceMotion = false) => createCartoonScene({isDark: false, aspect: 16 / 9, loadAssets: false, reduceMotion})
  const distanceToPlatform = (built: ReturnType<typeof build>, stop: number) => {
    const loco = built.scene.getObjectByName('train-loco')!
    const platform = built.scene.getObjectByName(`platform-${stop}`)!
    return loco.getWorldPosition(new THREE.Vector3()).distanceTo(platform.getWorldPosition(new THREE.Vector3()))
  }

  test('builds one platform and one station building per journey stop', () => {
    const built = build()
    for (let i = 0; i < 17; i++) {
      expect(built.scene.getObjectByName(`platform-${i}`)).toBeTruthy()
      expect(built.scene.getObjectByName(`station-${i}`)).toBeTruthy()
    }
  })

  test('runs to the centred stop and parks at its station', () => {
    const built = build()
    for (let i = 0; i < 60 * 20; i++) built.update(1 / 60, i / 60, 0, POINTER, 5)
    expect(distanceToPlatform(built, 5)).toBeLessThan(1.6)
  })

  test('with reduced motion it is at the station on the first frame', () => {
    const built = build(true)
    built.update(0, 0, 0, POINTER, 12)
    expect(distanceToPlatform(built, 12)).toBeLessThan(1.6)
  })

  test('keeps moving round the loop on the home page', () => {
    const built = build()
    built.update(1 / 60, 0, 0, POINTER, null)
    const loco = built.scene.getObjectByName('train-loco')!
    const start = loco.position.clone()
    for (let i = 0; i < 180; i++) built.update(1 / 60, i / 60, 0, POINTER, null)
    expect(loco.position.distanceTo(start)).toBeGreaterThan(1)
  })
})
