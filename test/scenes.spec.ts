import * as THREE from 'three'
import {describe, expect, test, vi} from 'vitest'
import {createCartoonScene} from '~/scenes/cartoon'
import {createGalaxyScene} from '~/scenes/galaxy'
import {createTerminalScene} from '~/scenes/terminal'
import {pointInRect, rectsOverlap} from '~/scenes/cartoon/footprint'
import {buildStations} from '~/scenes/cartoon/stations'
import {disposeScene} from '~/scenes/dispose'
import {journeyStations} from '~/data/journeyStations'
import {PROFILE_CONTENT} from '~/data/profile'
import {buildTrack} from '~/scenes/cartoon/track'
import {createKit} from '~/scenes/cartoon/kit'
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
    for (let i = 0; i < 60; i++) built.update(1 / 60, i / 60, 0, POINTER, null) // looping on /
    for (let i = 0; i < 60 * 20; i++) built.update(1 / 60, 1 + i / 60, 0, POINTER, 5)
    expect(distanceToPlatform(built, 5)).toBeLessThan(1.6)
    const curve = buildTrack(createKit(false)).curve
    const parked = curve.getPointAt((5 + 0.5) / 17)
    const loco = built.scene.getObjectByName('train-loco')!.position
    expect(Math.hypot(loco.x - parked.x, loco.z - parked.z)).toBeLessThan(1e-6)
  })

  test('a scene rebuilt on a journey stop starts parked there (no re-run across the island)', () => {
    const built = build()
    built.update(1 / 60, 0, 0, POINTER, 9)
    expect(distanceToPlatform(built, 9)).toBeLessThan(1.6)
  })

  test('smoke starts at the chimney, not at the world origin', () => {
    const built = build()
    built.update(1 / 60, 0, 0, POINTER, null)
    const loco = built.scene.getObjectByName('train-loco')!.getWorldPosition(new THREE.Vector3())
    const puffs = built.scene.getObjectByName('train')!.children.filter((c) => (c as THREE.Mesh).geometry?.type === 'IcosahedronGeometry')
    expect(puffs.length).toBeGreaterThan(0)
    for (const puff of puffs) expect(puff.position.distanceTo(loco)).toBeLessThan(4)
  })

  test('every platform and building clears the track and no two footprints overlap', () => {
    const kit = createKit(false)
    const track = buildTrack(kit)
    const rects = buildStations(kit, track, journeyStations(PROFILE_CONTENT.en), false).footprints
    const TRAIN_HALF_WIDTH = 0.6
    for (const [i, r] of rects.entries()) {
      const hit = track.samples.find((p) => pointInRect(r.rect, p.x, p.z, TRAIN_HALF_WIDTH))
      expect(hit, `${r.label} ${i} sits on the track`).toBeUndefined()
    }
    for (let a = 0; a < rects.length; a++) {
      for (let b = a + 1; b < rects.length; b++) {
        expect(rectsOverlap(rects[a].rect, rects[b].rect), `${rects[a].label} ${rects[a].station} overlaps ${rects[b].label} ${rects[b].station}`).toBe(false)
      }
    }
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

describe('disposeScene', () => {
  test('frees instanced buffers as well as geometries and materials', () => {
    const built = createCartoonScene({isDark: false, aspect: 1, loadAssets: false})
    const instanced: THREE.InstancedMesh[] = []
    built.scene.traverse((o) => (o as THREE.InstancedMesh).isInstancedMesh && instanced.push(o as THREE.InstancedMesh))
    expect(instanced.length).toBeGreaterThan(0)
    const spies = instanced.map((m) => vi.spyOn(m, 'dispose'))
    disposeScene(built.scene)
    for (const spy of spies) expect(spy).toHaveBeenCalled()
    expect(built.scene.children).toHaveLength(0)
  })
})
