import * as THREE from 'three'
import {describe, expect, test} from 'vitest'
import {applyView, createView, dragView, isDefaultView, VIEW_LIMITS, zoomView} from '~/scenes/viewControl'

const shot = () => {
  const camera = new THREE.PerspectiveCamera(50, 1.6, 0.1, 100)
  camera.position.set(0, 5, 10)
  const look = new THREE.Vector3(0, 0, 0)
  camera.lookAt(look)
  camera.userData.look = look
  return camera
}

describe('view control', () => {
  test('the default view leaves the camera exactly where the scene put it', () => {
    const camera = shot()
    applyView(camera, createView())
    expect(camera.position.toArray()).toEqual([0, 5, 10])
    expect(isDefaultView(createView())).toBe(true)
  })

  test('dragging sideways orbits around the look point at the same distance', () => {
    const camera = shot()
    const before = camera.position.distanceTo(camera.userData.look)
    applyView(camera, dragView(createView(), 200, 0))
    expect(camera.position.x).not.toBeCloseTo(0)
    expect(camera.position.distanceTo(camera.userData.look)).toBeCloseTo(before)
  })

  test('dragging up and down tilts, but never under the ground or over the top', () => {
    const down = dragView(createView(), 0, 100_000)
    const up = dragView(createView(), 0, -100_000)
    expect(down.pitch).toBe(VIEW_LIMITS.pitch[1])
    expect(up.pitch).toBe(VIEW_LIMITS.pitch[0])
  })

  test('zoom brings the camera closer or further, within limits', () => {
    const camera = shot()
    applyView(camera, zoomView(createView(), 2))
    expect(camera.position.distanceTo(camera.userData.look)).toBeCloseTo(Math.hypot(5, 10) / 2)
    expect(zoomView(createView(), 100).zoom).toBe(VIEW_LIMITS.zoom[1])
    expect(zoomView(createView(), 0.001).zoom).toBe(VIEW_LIMITS.zoom[0])
  })

  test('views are values: operations return new views', () => {
    const view = createView()
    const dragged = dragView(view, 10, 10)
    expect(dragged).not.toBe(view)
    expect(isDefaultView(view)).toBe(true)
    expect(isDefaultView(dragged)).toBe(false)
  })
})

describe('scenes and the view', () => {
  test.each([
    ['cartoon', () => import('~/scenes/cartoon').then((m) => m.createCartoonScene)],
    ['galaxy', () => import('~/scenes/galaxy').then((m) => m.createGalaxyScene)],
    ['terminal', () => import('~/scenes/terminal').then((m) => m.createTerminalScene)]
  ])('%s leaves its look point for the view to orbit around', async (_name, load) => {
    const factory = await load()
    const built = factory({isDark: false, aspect: 16 / 9, loadAssets: false, reduceMotion: true})
    for (const stop of [null, 2]) {
      built.update(0, 0, 0, {x: 0, y: 0}, stop, null)
      const look = built.camera.userData.look as THREE.Vector3
      expect(look?.isVector3, `stop ${stop}`).toBe(true)
      // The camera really is looking at it.
      const dir = built.camera.getWorldDirection(new THREE.Vector3())
      expect(dir.dot(look.clone().sub(built.camera.position).normalize())).toBeCloseTo(1, 5)
    }
  })
})

test('on the home page the look point sits at the model, so dragging orbits the model', async () => {
  const {createTerminalScene} = await import('~/scenes/terminal')
  const built = createTerminalScene({isDark: false, aspect: 16 / 9, loadAssets: false, reduceMotion: true})
  built.update(0, 0, 0, {x: 0, y: 0}, null, null)
  const model = new THREE.Box3().setFromObject(built.scene.getObjectByName('architecture')!, true)
  const look = built.camera.userData.look as THREE.Vector3
  expect(look.distanceTo(model.getCenter(new THREE.Vector3()))).toBeLessThan(model.getBoundingSphere(new THREE.Sphere()).radius)
})
