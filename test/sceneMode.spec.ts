import {describe, expect, test} from 'vitest'
import {hasSceneFor, readsOverSceneFor} from '~/utils/sceneMode'

describe('scene by mode', () => {
  test('vibes mode draws the scene on every page', () => {
    for (const name of ['index', 'about', 'blog', 'trips', 'trips-slug']) expect(hasSceneFor('vibes', name)).toBe(true)
  })

  test('cv mode draws only a trip, which is the page content', () => {
    for (const name of ['index', 'about', 'blog', 'trips', '']) expect(hasSceneFor('cv', name)).toBe(false)
    expect(hasSceneFor('cv', 'trips-slug')).toBe(true)
    expect(hasSceneFor('cv', 'trips-plan')).toBe(true)
  })

  test('the veil exists only where there is a scene and no panels', () => {
    expect(readsOverSceneFor('vibes', 'blog')).toBe(true)
    expect(readsOverSceneFor('vibes', 'about')).toBe(false)
    expect(readsOverSceneFor('cv', 'blog')).toBe(false)
    expect(readsOverSceneFor('cv', 'trips-slug')).toBe(false)
  })
})
