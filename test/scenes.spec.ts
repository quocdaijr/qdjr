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

    built.update(0.016, 0.016, 0, POINTER, null)
    const start = built.camera.position.clone()
    built.update(0.016, 0.032, 1, POINTER, null)
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
