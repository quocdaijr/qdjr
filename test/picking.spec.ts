import * as THREE from 'three'
import {expect, test} from 'vitest'
import {pickable, resolveAction, shouldHandleClick} from '~/scenes/picking'

test('resolveAction walks up to the nearest object that carries an action', () => {
  const station = pickable(new THREE.Group(), {type: 'stop', stop: 3})
  const wall = new THREE.Mesh()
  station.add(wall)
  const board = pickable(new THREE.Group(), {type: 'project', project: 2})
  station.add(board)
  const face = new THREE.Mesh()
  board.add(face)
  expect(resolveAction(wall)).toEqual({type: 'stop', stop: 3})
  expect(resolveAction(face)).toEqual({type: 'project', project: 2})
  expect(resolveAction(new THREE.Mesh())).toBeNull()
  expect(resolveAction(null)).toBeNull()
})

test('clicks on page UI never reach the scene', () => {
  document.body.innerHTML = `
    <main><div class="stop-panel"><p id="copy">x</p></div><a id="link" href="#"><span id="inner">a</span></a><button id="btn">b</button></main>
    <nav class="rail"><span id="rail">r</span></nav>
    <div id="bare"></div>`
  for (const id of ['copy', 'link', 'inner', 'btn', 'rail']) expect(shouldHandleClick(document.getElementById(id)), id).toBe(false)
  expect(shouldHandleClick(document.getElementById('bare'))).toBe(true)
  expect(shouldHandleClick(document.body)).toBe(true)
})
