import type {Mode} from '~/stores/theme'

// Routes matched by base name, not path: /en/about and /about are the same page.
// A trip page draws its road in every mode: the scene is its content.
export const TRIP_SCENE_PAGE_NAMES: readonly string[] = ['trips-slug', 'trips-plan']
// Pages laid out over the scene on purpose (their own panels); every other
// page reads over a veiled scene.
export const SCENE_PAGE_NAMES: readonly string[] = ['index', 'about', ...TRIP_SCENE_PAGE_NAMES]

/** Whether the layout mounts the three.js scene on this page in this mode. */
export function hasSceneFor(mode: Mode, routeName: string): boolean {
  return mode === 'vibes' || TRIP_SCENE_PAGE_NAMES.includes(routeName)
}

/** Whether the page reads over a veiled scene (a scene behind it, no panels of its own). */
export function readsOverSceneFor(mode: Mode, routeName: string): boolean {
  return hasSceneFor(mode, routeName) && !SCENE_PAGE_NAMES.includes(routeName)
}
