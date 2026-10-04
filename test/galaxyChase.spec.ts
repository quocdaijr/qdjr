import * as THREE from 'three'
import {expect, test} from 'vitest'
import {chaseShot} from '~/scenes/galaxy/chase'

const project = (shot: ReturnType<typeof chaseShot>, p: THREE.Vector3, aspect: number) => {
  const cam = new THREE.PerspectiveCamera(50, aspect, 0.1, 400)
  cam.position.copy(shot.eye)
  cam.lookAt(shot.look)
  cam.updateMatrixWorld()
  return p.clone().project(cam)
}

test('the body sits in the right half on wide screens, above the panel on phones', () => {
  const target = new THREE.Vector3(8, 0.5, -3)
  const wide = project(chaseShot(target, 0.5, 16 / 9), target, 16 / 9)
  expect(wide.x).toBeGreaterThan(0.1)
  expect(wide.x).toBeLessThan(0.8)
  const phone = project(chaseShot(target, 0.5, 0.5), target, 0.5)
  expect(Math.abs(phone.x)).toBeLessThan(0.25)
  expect(phone.y).toBeGreaterThan(0.15)
})

test('bigger bodies are framed from farther away', () => {
  const t = new THREE.Vector3(10, 0, 0)
  expect(chaseShot(t, 0.9, 1.6).eye.distanceTo(t)).toBeGreaterThan(chaseShot(t, 0.3, 1.6).eye.distanceTo(t))
})

test('the camera stands on the sunlit side of a planet', () => {
  const t = new THREE.Vector3(10, 0, 0)
  expect(chaseShot(t, 0.5, 1.6).eye.x).toBeLessThan(t.x)
})
