import * as THREE from 'three'
import {expect, test} from 'vitest'
import {panelAim} from '~/scenes/framing'

// Camera at the origin looking down -z: "left" on screen is -x.
const aim = (aspect: number) => panelAim(new THREE.Vector3(0, 0, -10), new THREE.Vector3(0, 0, 0), aspect, {shift: 4, drop: 3})

test('wide screens aim left of the subject so it sits right of the text panel', () => {
  const look = aim(16 / 9)
  expect(look.x).toBeCloseTo(-4)
  expect(look.y).toBeCloseTo(0)
})

test('phones aim below the subject so it shows above the centred panel', () => {
  const look = aim(0.5)
  expect(look.x).toBeCloseTo(0)
  expect(look.y).toBeCloseTo(-3)
})

test('returns a new vector and leaves the inputs alone', () => {
  const subject = new THREE.Vector3(1, 2, -10)
  const out = panelAim(subject, new THREE.Vector3(), 2, {shift: 4, drop: 3})
  expect(out).not.toBe(subject)
  expect(subject.toArray()).toEqual([1, 2, -10])
})
