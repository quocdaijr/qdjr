import type {SceneAction} from '~/scenes/types'

// The last thing clicked in the 3D scene. `at` makes repeated identical clicks fire.
export const useSceneAction = () => useState<{action: SceneAction; at: number} | null>('scene-action', () => null)
