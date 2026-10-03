import type {Object3D, PerspectiveCamera, Scene} from 'three'

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

/** What a click on a scene object asks for. */
export type SceneAction = {type: 'stop'; stop: number} | {type: 'project'; project: number} | {type: 'fun'; id: string}

export interface VibeScene {
  scene: Scene
  camera: PerspectiveCamera
  /** Objects the pointer can hit; each (or an ancestor) carries userData.action (see picking.ts). */
  pickables: Object3D[]
  /** Play a decorative reaction (train whistle, comet…); a no-op under reduced motion. */
  play(id: string, elapsed: number): void
  /**
   * Advance the scene one frame and place the camera.
   * @param dt seconds since the previous frame, clamped to 0.1
   * @param elapsed seconds since the scene was built
   * @param progress 0..1 position along the /about journey (0 on /)
   * @param pointer smoothed pointer, −1..1
   * @param stop index of the centred /about stop, or null when no journey page is mounted
   * @param focus item picked inside the centred stop (the Projects picker), or null
   */
  update(dt: number, elapsed: number, progress: number, pointer: ScenePointer, stop: number | null, focus: number | null): void
}

export type SceneFactory = (options: SceneOptions) => VibeScene

/** Exponential approach — frame-rate independent lerp. */
export function approach(current: number, target: number, dt: number, speed: number): number {
  return current + (target - current) * Math.min(1, dt * speed)
}
