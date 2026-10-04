import * as THREE from 'three'
import type {Colors} from './kit'

const SKY_RADIUS = 150
// Afternoon sun (or the moon at night): high, front-right, so it lights the faces the camera sees.
export const SUN_DIRECTION = new THREE.Vector3(0.5, 0.62, 0.6).normalize()

const VERTEX = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

// Painted gradient: the island floats in open sky, so the blend runs from
// haze well below the horizon up into the deep top (the cameras look down, and
// most of the visible dome is below the horizon line). Soft glow round the
// sun; at night, hashed star specks.
const FRAGMENT = /* glsl */ `
uniform vec3 uTop;
uniform vec3 uHorizon;
uniform vec3 uSun;
uniform vec3 uSunDir;
uniform float uStars;
varying vec3 vDir;
float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
void main() {
  float h = vDir.y;
  vec3 col = mix(uHorizon, uTop, smoothstep(-0.55, 0.3, h));
  float glow = pow(max(dot(vDir, uSunDir), 0.0), 18.0);
  col += uSun * glow * 0.55;
  float star = step(0.9985, hash(floor(vDir * 420.0))) * smoothstep(-0.3, 0.1, h) * uStars;
  col += vec3(star);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`

export function buildSky(colors: Colors, isDark: boolean): THREE.Mesh {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTop: {value: new THREE.Color(colors.skyTop)},
      uHorizon: {value: new THREE.Color(colors.horizon)},
      uSun: {value: new THREE.Color(colors.sunlight)},
      uSunDir: {value: SUN_DIRECTION.clone()},
      uStars: {value: isDark ? 1 : 0}
    },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false
  })
  const sky = new THREE.Mesh(new THREE.SphereGeometry(SKY_RADIUS, 32, 16), material)
  sky.name = 'sky'
  sky.renderOrder = -1
  return sky
}
