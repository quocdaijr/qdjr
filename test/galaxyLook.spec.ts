import type * as THREE from 'three'
import {describe, expect, test} from 'vitest'
import {createGalaxyScene} from '~/scenes/galaxy'

const POINTER = {x: 0, y: 0}
const build = (reduceMotion = false) => createGalaxyScene({isDark: true, aspect: 16 / 9, loadAssets: false, reduceMotion})
const body = (built: ReturnType<typeof build>, name: string) => {
  let found: THREE.Mesh | undefined
  built.scene.traverse((o) => {
    if (o.userData.body === name) found = o as THREE.Mesh
  })
  return found!
}
const uniforms = (m: THREE.Mesh) => (m.material as THREE.ShaderMaterial).uniforms

describe('painted planets', () => {
  test('every planet is painted by a shader with its own surface style', () => {
    const built = build()
    const styles = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'neptune'].map((name) => {
      const m = body(built, name)
      expect((m.material as THREE.ShaderMaterial).isShaderMaterial, name).toBe(true)
      return `${uniforms(m).uKind.value}:${uniforms(m).uSeed.value}`
    })
    expect(new Set(styles).size).toBe(7)
    expect(uniforms(body(built, 'jupiter')).uSpot.value).toBe(1) // the great red spot
  })

  test('earth has clouds and an atmosphere; neptune an atmosphere', () => {
    const built = build()
    const earth = body(built, 'earth')
    expect(earth.getObjectByName('earth-clouds')).toBeTruthy()
    expect(earth.getObjectByName('earth-atmosphere')).toBeTruthy()
    expect(body(built, 'neptune').getObjectByName('neptune-atmosphere')).toBeTruthy()
  })

  test('only saturn wears rings', () => {
    const built = build()
    expect(body(built, 'saturn').getObjectByName('saturn-ring')).toBeTruthy()
    expect(body(built, 'jupiter').children.some((c) => c.name.endsWith('-ring'))).toBe(false)
  })

  test("the sun's surface churns; it holds still under reduced motion", () => {
    const moving = build()
    for (let i = 0; i < 60; i++) moving.update(1 / 60, i / 60, 0, POINTER, null, null)
    expect(uniforms(body(moving, 'sun')).uTime.value).toBeGreaterThan(0.5)
    const still = build(true)
    still.update(0, 3, 0, POINTER, null, null)
    expect(uniforms(body(still, 'sun')).uTime.value).toBe(0)
  })
})

describe('detailed spacecraft', () => {
  const craft = (built: ReturnType<typeof build>, kind: string) => {
    const found: THREE.Object3D[] = []
    built.scene.traverse((o) => o.userData.kind === kind && found.push(o))
    return found[0]
  }
  const named = (o: THREE.Object3D, name: string) => {
    let n = 0
    o.traverse((c) => (n += c.name === name ? 1 : 0))
    return n
  }

  test('satellites and the station unfold gridded solar panels', () => {
    const built = build()
    expect(named(craft(built, 'satellite'), 'solar-panel')).toBeGreaterThanOrEqual(2)
    expect(named(craft(built, 'station'), 'solar-panel')).toBeGreaterThanOrEqual(4)
  })

  test('the probe carries a dish; the meteor a fiery tail; the moon is cratered rock', () => {
    const built = build()
    expect(named(craft(built, 'probe'), 'dish')).toBe(1)
    expect(named(craft(built, 'meteor'), 'meteor-tail')).toBe(1)
    const moon = craft(built, 'moon') as THREE.Mesh
    expect((moon.material as THREE.ShaderMaterial).isShaderMaterial).toBe(true)
  })
})
