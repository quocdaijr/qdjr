import type * as THREE from 'three'

// One breeze for the whole island. windOffset is the reference; SWAY_GLSL is
// the same formula on the GPU, applied to foliage before the instance matrix.
export const WIND = {amplitude: 0.12, speedX: 1.7, speedZ: 1.3, phaseX: 0.35, phaseZ: 0.3} as const

/** Sideways bend of a plant at height fraction h (0 at the base, 1 at the tip). */
export function windOffset(time: number, x: number, z: number, h: number): [number, number] {
  const bend = WIND.amplitude * h * h
  if (bend === 0) return [0, 0]
  return [
    Math.sin(time * WIND.speedX + x * WIND.phaseX + z * 0.2) * bend,
    Math.cos(time * WIND.speedZ + z * WIND.phaseZ) * bend * 0.5
  ]
}

const SWAY_GLSL = /* glsl */ `
#include <begin_vertex>
#ifdef USE_INSTANCING
  vec2 swayAt = instanceMatrix[3].xz;
#else
  vec2 swayAt = vec2(0.0);
#endif
float swayH = clamp((position.y - uSwayBase) / uSwayHeight, 0.0, 1.0);
float swayBend = ${WIND.amplitude.toFixed(3)} * swayH * swayH;
transformed.x += sin(uWindTime * ${WIND.speedX.toFixed(2)} + swayAt.x * ${WIND.phaseX.toFixed(2)} + swayAt.y * 0.2) * swayBend;
transformed.z += cos(uWindTime * ${WIND.speedZ.toFixed(2)} + swayAt.y * ${WIND.phaseZ.toFixed(2)}) * swayBend * 0.5;
`

export interface Wind {
  /** Shared by every swaying material; the scene writes elapsed time into it. */
  time: {value: number}
  /** Make `material` sway: geometry between y = base and base + height bends, the base stays put. */
  patch<M extends THREE.Material>(material: M, base: number, height: number): M
}

export function createWind(): Wind {
  const time = {value: 0}
  return {
    time,
    patch(material, base, height) {
      material.onBeforeCompile = (shader) => {
        shader.uniforms.uWindTime = time
        shader.uniforms.uSwayBase = {value: base}
        shader.uniforms.uSwayHeight = {value: height}
        shader.vertexShader = shader.vertexShader
          .replace('void main() {', 'uniform float uWindTime;\nuniform float uSwayBase;\nuniform float uSwayHeight;\nvoid main() {')
          .replace('#include <begin_vertex>', SWAY_GLSL)
      }
      // Same program for every swaying material; the uniforms differ per material.
      material.customProgramCacheKey = () => 'cartoon-sway'
      return material
    }
  }
}
