import type {PerspectiveCamera, Scene} from 'three'

export interface SceneOptions {
  isDark: boolean
  aspect: number
  /** Jump to end states instead of animating (prefers-reduced-motion). */
  reduceMotion?: boolean
  /** 'low' on coarse-pointer devices: fewer decorative instances. */
  detail?: 'high' | 'low'
  /** Load images and draw canvas textures; false in unit tests (no network, no 2D canvas). */
  loadAssets?: boolean
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
   * @param stop index of the centred /about stop, or null when no journey page is mounted
   */
  update(dt: number, elapsed: number, progress: number, pointer: ScenePointer, stop: number | null): void
}

export type SceneFactory = (options: SceneOptions) => VibeScene

/** Exponential approach — frame-rate independent lerp. */
export function approach(current: number, target: number, dt: number, speed: number): number {
  return current + (target - current) * Math.min(1, dt * speed)
}
