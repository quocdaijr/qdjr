import {describe, expect, test} from 'vitest'
import {journeyStations} from '~/data/journeyStations'
import {PROFILE_CONTENT} from '~/data/profile'
import {createCartoonScene} from '~/scenes/cartoon'
import {createGalaxyScene} from '~/scenes/galaxy'
import {resolveAction} from '~/scenes/picking'
import {createTerminalScene} from '~/scenes/terminal'
import type {SceneAction} from '~/scenes/types'

const STOPS = journeyStations(PROFILE_CONTENT.en).length
const PROJECTS = PROFILE_CONTENT.en.projects.length
const range = (n: number) => new Set(Array.from({length: n}, (_, i) => i))
const FUN = {cartoon: ['whistle', 'spin'], galaxy: ['comet'], terminal: ['burst']} as const
const POINTER = {x: 0, y: 0}

describe.each([['cartoon', createCartoonScene], ['galaxy', createGalaxyScene], ['terminal', createTerminalScene]] as const)('%s pickables', (name, factory) => {
  const built = factory({isDark: false, aspect: 16 / 9, loadAssets: false})
  const actions = built.pickables.map((o) => resolveAction(o)).filter((a): a is SceneAction => a !== null)

  test('every pickable resolves to an action', () => expect(actions).toHaveLength(built.pickables.length))
  test('every stop is reachable', () => expect(new Set(actions.flatMap((a) => (a.type === 'stop' ? [a.stop] : [])))).toEqual(range(STOPS)))
  test('every project is reachable', () => expect(new Set(actions.flatMap((a) => (a.type === 'project' ? [a.project] : [])))).toEqual(range(PROJECTS)))
  test('easter eggs play without errors', () => {
    expect(new Set(actions.flatMap((a) => (a.type === 'fun' ? [a.id] : [])))).toEqual(new Set(FUN[name]))
    built.update(1 / 60, 1, 0, POINTER, 2, null)
    for (const id of FUN[name]) expect(() => built.play(id, 1)).not.toThrow()
    for (let i = 0; i < 120; i++) built.update(1 / 60, 1 + i / 60, 0, POINTER, 2, null)
    expect(built.camera.position.toArray().every(Number.isFinite)).toBe(true)
  })
})
