import * as THREE from 'three'

// The reader's own adjustment on top of whatever shot a scene frames: orbit
// (drag) and zoom (wheel, pinch, buttons). Scenes leave their look point in
// camera.userData.look; applyView turns the camera around it after each
// update, so the scene's own smoothing never sees the adjustment.
export interface View {
  yaw: number // radians around the world up axis
  pitch: number // radians, positive tilts the camera up and over
  zoom: number // > 1 is closer
}

export const VIEW_LIMITS = {pitch: [-0.5, 0.9], zoom: [0.5, 3]} as const
const DRAG_SPEED = 0.005 // radians per pixel

export const createView = (): View => ({yaw: 0, pitch: 0, zoom: 1})

export const isDefaultView = (view: View) => view.yaw === 0 && view.pitch === 0 && view.zoom === 1

export function dragView(view: View, dx: number, dy: number): View {
  return {
    ...view,
    yaw: view.yaw - dx * DRAG_SPEED,
    pitch: THREE.MathUtils.clamp(view.pitch + dy * DRAG_SPEED, VIEW_LIMITS.pitch[0], VIEW_LIMITS.pitch[1])
  }
}

export function zoomView(view: View, factor: number): View {
  return {...view, zoom: THREE.MathUtils.clamp(view.zoom * factor, VIEW_LIMITS.zoom[0], VIEW_LIMITS.zoom[1])}
}

// Polar angle limits from straight up: never over the top, never far below the horizon.
const POLAR = {min: 0.12, max: 1.75}

/** Orbit and zoom the camera around camera.userData.look. A no-op for the default view. */
export function applyView(camera: THREE.PerspectiveCamera, view: View): void {
  const look = camera.userData.look as THREE.Vector3 | undefined
  if (!look || isDefaultView(view)) return
  const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(look))
  spherical.theta += view.yaw
  spherical.phi = THREE.MathUtils.clamp(spherical.phi - view.pitch, POLAR.min, POLAR.max)
  spherical.radius /= view.zoom
  camera.position.copy(look).add(new THREE.Vector3().setFromSpherical(spherical))
  camera.lookAt(look)
  camera.updateMatrixWorld()
}
