import * as THREE from 'three'
import {describe, expect, test} from 'vitest'
import {createCartoonScene} from '~/scenes/cartoon'
import {WIND, windOffset} from '~/scenes/cartoon/wind'

const POINTER = {x: 0, y: 0}
const build = (isDark = false, extra: {reduceMotion?: boolean; detail?: 'high' | 'low'} = {}) =>
  createCartoonScene({isDark, aspect: 16 / 9, loadAssets: false, ...extra})
const run = (built: ReturnType<typeof build>, seconds: number) => {
  for (let i = 0; i < seconds * 60; i++) built.update(1 / 60, i / 60, 0, POINTER, null, null)
}
const positions = (o: THREE.Object3D | undefined) => Array.from(((o as THREE.Points).geometry.attributes.position.array as Float32Array))

describe('ghibli cartoon look', () => {
  test('a painted sky dome replaces the flat background', () => {
    const built = build()
    const sky = built.scene.getObjectByName('sky') as THREE.Mesh
    expect(sky).toBeTruthy()
    const material = sky.material as THREE.ShaderMaterial
    expect(material.isShaderMaterial).toBe(true)
    expect(material.side).toBe(THREE.BackSide)
    expect(built.scene.background).toBeNull()
  })

  test('cumulus clouds are one instanced mesh that drifts', () => {
    for (const [detail, min] of [['high', 60], ['low', 30]] as const) {
      const built = build(false, {detail})
      const puffs = built.scene.getObjectByName('cloud-puffs') as THREE.InstancedMesh
      expect(puffs.isInstancedMesh).toBe(true)
      expect(puffs.count).toBeGreaterThanOrEqual(min)
      const before = Array.from(puffs.instanceMatrix.array)
      run(built, 2)
      expect(Array.from(puffs.instanceMatrix.array)).not.toEqual(before)
    }
  })

  test('a meadow of grass tufts, fewer on phones', () => {
    const high = build().scene.getObjectByName('grass') as THREE.InstancedMesh
    const low = build(false, {detail: 'low'}).scene.getObjectByName('grass') as THREE.InstancedMesh
    expect(high.count).toBeGreaterThan(low.count)
    expect(low.count).toBeGreaterThan(100)
  })

  test('petals by day, fireflies at night, and both move', () => {
    const day = build(false)
    const night = build(true)
    expect(day.scene.getObjectByName('petals')).toBeTruthy()
    expect(day.scene.getObjectByName('fireflies')).toBeUndefined()
    expect(night.scene.getObjectByName('fireflies')).toBeTruthy()
    expect(night.scene.getObjectByName('petals')).toBeUndefined()
    const before = positions(day.scene.getObjectByName('petals'))
    run(day, 3)
    const after = positions(day.scene.getObjectByName('petals'))
    expect(after).not.toEqual(before)
    expect(after.every(Number.isFinite)).toBe(true)
  })

  test('wind drives the sway uniform; reduced motion keeps everything still', () => {
    const moving = build()
    moving.update(1 / 60, 3, 0, POINTER, null, null)
    expect(moving.scene.userData.windTime).toBe(3)

    const still = build(false, {reduceMotion: true})
    const petals = positions(still.scene.getObjectByName('petals'))
    still.update(1 / 60, 3, 0, POINTER, null, null)
    expect(still.scene.userData.windTime).toBe(0)
    expect(positions(still.scene.getObjectByName('petals'))).toEqual(petals)
  })
})

describe('windOffset', () => {
  test('is zero at the base and bounded by the amplitude at the tip', () => {
    for (const t of [0, 0.7, 3.1, 12]) {
      expect(windOffset(t, 4, -2, 0)).toEqual([0, 0])
      const [dx, dz] = windOffset(t, 4, -2, 1)
      expect(Math.abs(dx)).toBeLessThanOrEqual(WIND.amplitude)
      expect(Math.abs(dz)).toBeLessThanOrEqual(WIND.amplitude)
    }
  })

  test('neighbouring plants sway out of phase', () => {
    expect(windOffset(1, 0, 0, 1)[0]).not.toBeCloseTo(windOffset(1, 6, 3, 1)[0])
  })
})
