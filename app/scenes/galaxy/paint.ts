import * as THREE from 'three'

// Procedural "storybook" paint for the solar system: every surface is a
// shader (no image files, design.md § Per-page allowances). Noise lives in
// object space so features turn with the body. The sun at the origin is the
// light: soft cartoon terminator, a rim highlight, ambient fill.

const NOISE = /* glsl */ `
float hash3(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n000 = hash3(i), n100 = hash3(i + vec3(1, 0, 0)), n010 = hash3(i + vec3(0, 1, 0)), n110 = hash3(i + vec3(1, 1, 0));
  float n001 = hash3(i + vec3(0, 0, 1)), n101 = hash3(i + vec3(1, 0, 1)), n011 = hash3(i + vec3(0, 1, 1)), n111 = hash3(i + vec3(1, 1, 1));
  return mix(mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y), mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y), f.z);
}
float fbm(vec3 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise3(p); p *= 2.03; a *= 0.5; }
  return v;
}
`

const VERTEX = /* glsl */ `
varying vec3 vObj;
varying vec3 vNormalW;
varying vec3 vPosW;
void main() {
  vObj = position;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 w = modelMatrix * vec4(position, 1.0);
  vPosW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`

// Light from the sun at the origin, with a soft cartoon terminator.
const LIGHT = /* glsl */ `
float sunlight(vec3 n, vec3 posW, float ambient) {
  float d = dot(normalize(n), normalize(-posW));
  return ambient + (1.0 - ambient) * smoothstep(-0.05, 0.45, d);
}
float rim(vec3 n, vec3 posW) {
  return pow(1.0 - max(dot(normalize(n), normalize(cameraPosition - posW)), 0.0), 3.0);
}
`

const SURFACE = /* glsl */ `
uniform int uKind;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;
uniform vec3 uD;
uniform float uSeed;
uniform float uSpot;
uniform float uAmbient;
varying vec3 vObj;
varying vec3 vNormalW;
varying vec3 vPosW;
${NOISE}
${LIGHT}
vec3 rocky(vec3 p) {
  vec3 col = mix(uA, uB, fbm(p * 3.0 + uSeed));
  // Small craters: dark floors ringed by a lighter rim.
  float c = noise3(p * 12.0 + uSeed * 3.0);
  col = mix(col, uC, smoothstep(0.76, 0.8, c) * 0.8);
  return mix(col, uD, (smoothstep(0.7, 0.74, c) - smoothstep(0.74, 0.76, c)) * 0.7);
}
vec3 swirls(vec3 p) {
  float n = fbm(p * 2.5 + uSeed);
  return mix(uA, uB, 0.5 + 0.5 * sin(p.y * 7.0 + n * 6.0));
}
vec3 earth(vec3 p) {
  float land = fbm(p * 2.2 + uSeed);
  vec3 sea = mix(uA, uB, smoothstep(0.35, 0.5, land));
  vec3 ground = mix(uD, uC, smoothstep(0.5, 0.56, land));
  vec3 col = mix(sea, ground, smoothstep(0.49, 0.5, land));
  return mix(col, vec3(0.96), smoothstep(0.84, 0.88, abs(p.y)));
}
vec3 mars(vec3 p) {
  vec3 col = mix(uA, uB, smoothstep(0.5, 0.6, fbm(p * 2.8 + uSeed)));
  return mix(col, vec3(0.97, 0.93, 0.9), smoothstep(0.9, 0.93, abs(p.y)));
}
vec3 bands(vec3 p) {
  float warp = fbm(p * 3.0 + uSeed) * 0.9;
  float b = 0.5 + 0.5 * sin(p.y * 13.0 + warp * 4.0);
  vec3 col = mix(uA, uB, b);
  col = mix(col, uC, smoothstep(0.55, 0.9, fbm(vec3(p.y * 9.0, p.x * 0.8, p.z * 0.8) + uSeed)) * 0.6);
  // The great red spot, on bodies that have one.
  vec3 centre = normalize(vec3(0.8, -0.3, 0.5));
  float spot = 1.0 - smoothstep(0.1, 0.17, length((p - centre) * vec3(0.6, 1.5, 0.6)));
  return mix(col, uD, spot * uSpot);
}
void main() {
  vec3 p = normalize(vObj);
  vec3 col = uKind == 0 ? rocky(p) : uKind == 1 ? swirls(p) : uKind == 2 ? earth(p) : uKind == 3 ? mars(p) : bands(p);
  col *= sunlight(vNormalW, vPosW, uAmbient);
  col += vec3(0.35, 0.45, 0.7) * rim(vNormalW, vPosW) * 0.35;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`

export type SurfaceKind = 'rocky' | 'swirls' | 'earth' | 'mars' | 'bands'
const KIND_INDEX: Readonly<Record<SurfaceKind, number>> = {rocky: 0, swirls: 1, earth: 2, mars: 3, bands: 4}

export interface SurfaceStyle {
  kind: SurfaceKind
  colors: readonly [number, number, number, number]
  seed: number
  spot?: boolean
}

export function surfaceMaterial(style: SurfaceStyle, ambient: number): THREE.ShaderMaterial {
  const [a, b, c, d] = style.colors.map((hex) => new THREE.Color(hex))
  return new THREE.ShaderMaterial({
    uniforms: {
      uKind: {value: KIND_INDEX[style.kind]},
      uA: {value: a},
      uB: {value: b},
      uC: {value: c},
      uD: {value: d},
      uSeed: {value: style.seed},
      uSpot: {value: style.spot ? 1 : 0},
      uAmbient: {value: ambient}
    },
    vertexShader: VERTEX,
    fragmentShader: SURFACE
  })
}

/** The sun: churning granules, a brighter limb. Unlit (it is the light). */
export function sunMaterial(core: number, flare: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {uCore: {value: new THREE.Color(core)}, uFlare: {value: new THREE.Color(flare)}, uTime: {value: 0}},
    vertexShader: VERTEX,
    fragmentShader: /* glsl */ `
      uniform vec3 uCore;
      uniform vec3 uFlare;
      uniform float uTime;
      varying vec3 vObj;
      varying vec3 vNormalW;
      varying vec3 vPosW;
      ${NOISE}
      ${LIGHT}
      void main() {
        vec3 p = normalize(vObj);
        float g = fbm(p * 4.0 + vec3(uTime * 0.08, uTime * 0.05, 0.0));
        vec3 col = mix(uCore, uFlare, smoothstep(0.35, 0.75, g));
        col = mix(col, uFlare * 1.15, rim(vNormalW, vPosW));
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`
  })
}

/**
 * A soft glow shell (the sun's corona, a planet's atmosphere): drawn on the
 * back faces of a slightly larger sphere, brightest at the body's rim and
 * fading to nothing at the shell's edge.
 */
export function glowMaterial(color: number, strength: number, power: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {uColor: {value: new THREE.Color(color)}, uStrength: {value: strength}, uPower: {value: power}},
    vertexShader: VERTEX,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uStrength;
      uniform float uPower;
      varying vec3 vObj;
      varying vec3 vNormalW;
      varying vec3 vPosW;
      void main() {
        float facing = abs(dot(normalize(vNormalW), normalize(cameraPosition - vPosW)));
        float a = pow(facing, uPower) * uStrength;
        gl_FragColor = vec4(uColor, a);
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  })
}

/** Drifting white cloud cover, lit by the sun. */
export function cloudMaterial(seed: number, ambient: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {uSeed: {value: seed}, uTime: {value: 0}, uAmbient: {value: ambient}},
    vertexShader: VERTEX,
    fragmentShader: /* glsl */ `
      uniform float uSeed;
      uniform float uTime;
      uniform float uAmbient;
      varying vec3 vObj;
      varying vec3 vNormalW;
      varying vec3 vPosW;
      ${NOISE}
      ${LIGHT}
      void main() {
        vec3 p = normalize(vObj);
        float c = smoothstep(0.52, 0.66, fbm(p * 3.2 + vec3(uTime * 0.02, 0.0, uSeed)));
        gl_FragColor = vec4(vec3(1.0) * sunlight(vNormalW, vPosW, uAmbient), c * 0.85);
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false
  })
}

/** Banded planetary rings on a RingGeometry between inner and outer radius. */
export function ringMaterial(a: number, b: number, inner: number, outer: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {uA: {value: new THREE.Color(a)}, uB: {value: new THREE.Color(b)}, uInner: {value: inner}, uOuter: {value: outer}},
    vertexShader: /* glsl */ `
      varying vec3 vLocal;
      void main() {
        vLocal = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uA;
      uniform vec3 uB;
      uniform float uInner;
      uniform float uOuter;
      varying vec3 vLocal;
      void main() {
        float t = (length(vLocal.xy) - uInner) / (uOuter - uInner);
        float band = 0.5 + 0.5 * sin(t * 38.0);
        float gap = smoothstep(0.55, 0.58, t) * (1.0 - smoothstep(0.6, 0.63, t)); // the Cassini division
        float edge = smoothstep(0.0, 0.06, t) * (1.0 - smoothstep(0.94, 1.0, t));
        gl_FragColor = vec4(mix(uA, uB, band), edge * (1.0 - gap) * 0.85);
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide
  })
}

/** Solar-panel cells: dark blue squares on a lighter grid. Unlit, both sides. */
export function panelMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vec2 cell = fract(vUv * vec2(8.0, 3.0));
        float line = step(cell.x, 0.08) + step(cell.y, 0.12);
        vec3 col = mix(vec3(0.13, 0.27, 0.62), vec3(0.72, 0.8, 0.92), clamp(line, 0.0, 1.0));
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
    side: THREE.DoubleSide
  })
}
