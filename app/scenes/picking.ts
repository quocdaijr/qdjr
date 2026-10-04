import type * as THREE from 'three'
import type {SceneAction} from './types'

// Page UI always wins over the scene underneath it.
const PAGE_UI = 'a, button, input, select, textarea, label, summary, [role="button"], .stop-panel, .trip-panel, .reads-over-scene, header, footer, nav, .rail'

export function shouldHandleClick(target: Element | null): boolean {
  return !target?.closest(PAGE_UI)
}

/** The action of the nearest object (the hit itself or an ancestor) that carries one. */
export function resolveAction(hit: THREE.Object3D | null): SceneAction | null {
  for (let o = hit; o; o = o.parent) {
    const action = o.userData.action as SceneAction | undefined
    if (action) return action
  }
  return null
}

/** Tag an object as clickable. */
export function pickable<T extends THREE.Object3D>(object: T, action: SceneAction): T {
  object.userData.action = action
  return object
}
