import * as THREE from 'three'
import {describe, expect, test} from 'vitest'
import {createCartoonScene} from '~/scenes/cartoon'
import {createGalaxyScene} from '~/scenes/galaxy'
import {createTerminalScene} from '~/scenes/terminal'
import type {SceneFactory} from '~/scenes/types'

// On the home page (no journey stop) the whole model must fit the viewport —
// nothing clipped off the right — and fill a good part of it, at any width.
// The cartoon is measured from the island's top: its rock base may hang off-screen.
const MODELS: Array<[string, SceneFactory, string, number]> = [
  ['cartoon', createCartoonScene, 'world', -3],
  ['terminal', createTerminalScene, 'architecture', -Infinity],
  ['galaxy', createGalaxyScene, 'bodies', -Infinity]
]
const POINTER = {x: 0, y: 0}

function screenBox(factory: SceneFactory, model: string, aspect: number, floor: number) {
  const built = factory({isDark: false, aspect, loadAssets: false, reduceMotion: true})
  built.update(0, 0, 0, POINTER, null, null)
  built.camera.updateMatrixWorld()
  const box = new THREE.Box3().setFromObject(built.scene.getObjectByName(model)!, true)
  box.min.y = Math.max(box.min.y, floor)
  const xs: number[] = []
  const ys: number[] = []
  for (const x of [box.min.x, box.max.x]) {
    for (const y of [box.min.y, box.max.y]) {
      for (const z of [box.min.z, box.max.z]) {
        const p = new THREE.Vector3(x, y, z).project(built.camera)
        xs.push(p.x)
        ys.push(p.y)
      }
    }
  }
  return {minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys)}
}

describe.each(MODELS)('%s home view', (_name, factory, model, floor) => {
  test.each([1.3, 16 / 9, 2.4])('fits inside the viewport and fills it, right of the hero (aspect %s)', (aspect) => {
    const b = screenBox(factory, model, aspect, floor)
    expect(b.maxX, 'clipped on the right').toBeLessThanOrEqual(1)
    expect(b.minY, 'clipped at the bottom').toBeGreaterThanOrEqual(-1.05)
    expect(b.maxY, 'under the header').toBeLessThanOrEqual(0.85)
    expect(b.maxX - b.minX, 'too small: the page looks empty').toBeGreaterThanOrEqual(1)
    expect((b.minX + b.maxX) / 2, 'should sit right of centre').toBeGreaterThan(0.1)
  })

  test('on phones it sits below the hero text', () => {
    const b = screenBox(factory, model, 0.5, floor)
    expect(b.maxX).toBeLessThanOrEqual(1.05)
    expect(b.minX).toBeGreaterThanOrEqual(-1.05)
    expect((b.minY + b.maxY) / 2).toBeLessThan(0)
  })
})
