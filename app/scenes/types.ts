import type {PerspectiveCamera, Scene} from 'three'

export interface SceneOptions {
  isDark: boolean
  aspect: number
}

/** Normalised pointer position, −1..1 on both axes, already smoothed by the stage. */
export interface ScenePointer {
  x: number
  y: number
}

export interface VibeScene {
  scene: Scene
  camera: PerspectiveCamera
  /**
   * Advance the scene one frame and place the camera.
   * @param dt seconds since the previous frame, clamped to 0.1
   * @param elapsed seconds since the scene was built
   * @param progress 0..1 position along the /about journey (0 on /)
   * @param pointer smoothed pointer, −1..1
   */
  update(dt: number, elapsed: number, progress: number, pointer: ScenePointer): void
}

export type SceneFactory = (options: SceneOptions) => VibeScene

/** Exponential approach — frame-rate independent lerp. */
export function approach(current: number, target: number, dt: number, speed: number): number {
  return current + (target - current) * Math.min(1, dt * speed)
}
